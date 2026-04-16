/**
 * Manages the conductivity sync queue state and triggers sync on reconnect.
 * Use in ConductivityPanel to drive the status bar, sync button, SQL export,
 * and the Failed Operations section.
 *
 * Behaviour:
 *   - Loads queue stats + failed records on mount
 *   - Auto-syncs (debounced 1.5s) when isOnline transitions false→true
 *   - Polls stats every 30s while online (catches records added in other tabs)
 *   - Coordinates across tabs via BroadcastChannel('ccasa_conductivity_sync')
 *   - Listens for TRIGGER_SYNC messages from the service worker (Background Sync)
 *   - Registers Background Sync when records remain after a failed sync
 *   - Exposes lastSyncCompletedAt so the panel can call fetchRecords on sync finish
 *
 * @module useConductivityQueue
 * @dependencies react, conductivitySyncEngine, conductivityOfflineDb, useConnectivity, logger
 * @example
 *   const apiFetch = useMemo(() => makeSyncApiFetch(token), [token])
 *   const { stats, isSyncing, triggerSync, exportSQL, failedRecords, retryFailed, dismissFailed, lastSyncCompletedAt } = useConductivityQueue(apiFetch)
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { createLogger } from '@/lib/logger'
import {
  downloadSQLExport,
  getQueueStats,
  listFailedPermanent,
  removeQueueItem,
  resetToRetry,
} from '@/lib/ccasa/conductivityOfflineDb'
import { getIsSyncing, syncQueue } from '@/lib/ccasa/conductivitySyncEngine'
import { useConnectivity } from '@/hooks/useConnectivity'
import type { ApiFetchFn, OutboxRecord, QueueStats } from '@/types/conductivityOffline'

const log = createLogger('useConductivityQueue')
const BROADCAST_CHANNEL = 'ccasa_conductivity_sync'
const POLL_INTERVAL_MS = 30_000
const AUTO_SYNC_DEBOUNCE_MS = 1_500

/** SyncManager interface — not included in all TS lib targets */
interface SyncManager {
  register(tag: string): Promise<void>
}
interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: SyncManager
}

export interface ConductivityQueueState {
  stats: QueueStats | null
  isSyncing: boolean
  lastSyncAt: Date | null

  /** Timestamp of the last successful sync — watch this to trigger fetchRecords */
  lastSyncCompletedAt: Date | null
  syncError: string | null

  /** failed_permanent records — shown in the Failed Operations UI section */
  failedRecords: OutboxRecord[]
  triggerSync: () => Promise<void>
  exportSQL: () => Promise<void>

  /** Resets a failed record to 'pending' and triggers an immediate sync */
  retryFailed: (localId: number) => Promise<void>

  /** Permanently removes a failed record from the queue */
  dismissFailed: (localId: number) => Promise<void>
}

/**
 * @param apiFetch Raw fetch adapter (returns Promise<Response>) created via makeSyncApiFetch
 */
export function useConductivityQueue(apiFetch: ApiFetchFn): ConductivityQueueState {
  const { isOnline } = useConnectivity()

  const [stats, setStats] = useState<QueueStats | null>(null)
  const [syncingState, setSyncingState] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [lastSyncCompletedAt, setLastSyncCompletedAt] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [failedRecords, setFailedRecords] = useState<OutboxRecord[]>([])

  const autoSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const apiFetchRef = useRef(apiFetch)
  const prevIsOnlineRef = useRef<boolean | null>(null)

  // Keep apiFetch ref fresh to avoid stale closures in triggerSync
  useEffect(() => {
    apiFetchRef.current = apiFetch
  }, [apiFetch])

  const refreshStats = useCallback(async () => {
    try {
      const [s, failed] = await Promise.all([getQueueStats(), listFailedPermanent()])

      setStats(s)
      setFailedRecords(failed)
    } catch (err) {
      log.error('Error al obtener estadísticas de cola', err)
    }
  }, [])

  const triggerSync = useCallback(async () => {
    if (getIsSyncing()) {
      log.debug('Sync ya en curso — omitido')
      
return
    }

    setSyncingState(true)
    setSyncError(null)
    log.info('Iniciando sincronización desde hook')

    try {
      await syncQueue(apiFetchRef.current, updatedStats => {
        setStats(updatedStats)
      })

      const [finalStats, failed] = await Promise.all([getQueueStats(), listFailedPermanent()])

      setStats(finalStats)
      setFailedRecords(failed)
      const now = new Date()

      setLastSyncAt(now)
      setLastSyncCompletedAt(now) // signal for panel to call fetchRecords
      log.info('Sincronización completada', finalStats)

      // Notify other tabs via BroadcastChannel
      try {
        channelRef.current?.postMessage({ type: 'SYNC_COMPLETE', ts: Date.now() })
      } catch {
        // BroadcastChannel may not be available in all test environments
      }

      // Register Background Sync if records still remain
      const remaining = finalStats.pending + finalStats.failedRetryable

      if (remaining > 0 && 'serviceWorker' in navigator) {
        try {
          const reg = (await navigator.serviceWorker.ready) as ServiceWorkerRegistrationWithSync

          if ('sync' in reg) {
            await reg.sync.register('ccasa-conductivity-sync')
            log.info('Background sync registrado para registros pendientes', { remaining })
          }
        } catch (bgErr) {
          log.warn('Background Sync API no disponible', bgErr)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)

      setSyncError(msg)
      log.error('Error en triggerSync', err)
    } finally {
      setSyncingState(false)
    }
  }, [])

  const exportSQL = useCallback(async () => {
    try {
      await downloadSQLExport()
      log.info('Exportación SQL iniciada')
    } catch (err) {
      log.error('Error al exportar SQL', err)
      throw err
    }
  }, [])

  const retryFailed = useCallback(
    async (localId: number) => {
      try {
        await resetToRetry(localId)
        await refreshStats()
        log.info('Registro reseteado para reintento', { localId })

        // Attempt immediate sync
        void triggerSync()
      } catch (err) {
        log.error('Error al reintentar registro fallido', { localId, err })
        throw err
      }
    },
    [refreshStats, triggerSync]
  )

  const dismissFailed = useCallback(
    async (localId: number) => {
      try {
        await removeQueueItem(localId)
        setFailedRecords(prev => prev.filter(r => r.localId !== localId))
        await refreshStats()
        log.info('Registro fallido descartado', { localId })
      } catch (err) {
        log.error('Error al descartar registro fallido', { localId, err })
        throw err
      }
    },
    [refreshStats]
  )

  // Load stats + failed records on mount
  useEffect(() => {
    void refreshStats()
  }, [refreshStats])

  // Auto-sync when transitioning from offline → online (debounced)
  useEffect(() => {
    if (prevIsOnlineRef.current === false && isOnline) {
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current)

      autoSyncTimerRef.current = setTimeout(() => {
        void (async () => {
          const current = await getQueueStats()

          if (current.pending + current.failedRetryable > 0) {
            log.info('Auto-sincronizando al reconectar')
            void triggerSync()
          }
        })()
      }, AUTO_SYNC_DEBOUNCE_MS)
    }

    prevIsOnlineRef.current = isOnline
  }, [isOnline, triggerSync])

  // Poll stats every 30s while online
  useEffect(() => {
    if (!isOnline) return
    const interval = setInterval(() => void refreshStats(), POLL_INTERVAL_MS)

    
return () => clearInterval(interval)
  }, [isOnline, refreshStats])

  // BroadcastChannel: receive sync notifications from other tabs
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    const channel = new BroadcastChannel(BROADCAST_CHANNEL)

    channelRef.current = channel

    channel.onmessage = (event: MessageEvent<{ type: string }>) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        log.debug('Sincronización detectada en otra pestaña — actualizando estadísticas')
        void refreshStats()

        // Also signal the panel to refresh its records
        setLastSyncCompletedAt(new Date())
      }
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [refreshStats])

  // Listen for TRIGGER_SYNC messages from the service worker (Background Sync API)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    const handleMessage = (event: MessageEvent<{ type: string; tag?: string }>) => {
      if (event.data?.type === 'TRIGGER_SYNC') {
        log.info('Background sync solicitado por service worker', { tag: event.data.tag })
        void triggerSync()
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [triggerSync])

  // Cleanup auto-sync timer on unmount
  useEffect(() => {
    return () => {
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current)
    }
  }, [])

  return {
    stats,
    isSyncing: syncingState,
    lastSyncAt,
    lastSyncCompletedAt,
    syncError,
    failedRecords,
    triggerSync,
    exportSQL,
    retryFailed,
    dismissFailed,
  }
}
