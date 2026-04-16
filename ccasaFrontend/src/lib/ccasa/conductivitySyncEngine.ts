/**
 * FIFO sync engine for the conductivity offline queue.
 * Processes one record at a time to preserve operation ordering.
 * Idempotent: safe to call concurrently — a module-level lock prevents re-entry.
 *
 * Retry policy:
 *   HTTP 2xx                        → done (success)
 *   HTTP 404 / 409                  → failed_permanent + conflict=true
 *   Other HTTP 4xx                  → failed_permanent (bad data, never retry)
 *   HTTP 5xx / network error        → failed_retryable (retry up to maxRetries)
 *
 * Deduplication (applied before processing):
 *   CREATE + UPDATE (same localObjectId) → merge payload into the CREATE, drop UPDATE
 *   CREATE + DELETE (same localObjectId) → drop both
 *   Identical CREATEs (same endpoint+payload) → keep oldest, drop duplicates
 *
 * NOTE: Requests include the header 'X-Sync-Engine: 1' so the service worker
 * does not intercept them with the offline-202 fallback.
 *
 * @module conductivitySyncEngine
 * @dependencies conductivityOfflineDb, logger, @/types/conductivityOffline
 * @example
 *   const result = await syncQueue(apiFetchFn, stats => setStats(stats))
 */

import { createLogger } from '@/lib/logger'
import {
  cleanupQueue,
  getQueueStats,
  getPendingQueue,
  markDone,
  markFailedPermanent,
  markFailedRetryable,
  markSyncing,
  removeQueueItem,
} from '@/lib/ccasa/conductivityOfflineDb'
import type { ApiFetchFn, OutboxRecord, QueueStats, SyncResult } from '@/types/conductivityOffline'

const log = createLogger('conductivitySyncEngine')

/** Module-level lock: prevents concurrent sync runs across hook instances. */
let isSyncing = false

/** Returns true if a sync is currently in progress. */
export function getIsSyncing(): boolean {
  return isSyncing
}

/** Generates a compact correlation ID for log tracing. */
function newCorrelationId(): string {
  return `sync-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Deduplicates the queue before processing:
 *
 * 1. CREATE + DELETE (same localObjectId) → drop both (cancel each other out)
 * 2. CREATE + UPDATE (same localObjectId) → merge UPDATE payload into CREATE, drop UPDATE
 * 3. Exact duplicate CREATEs (same endpoint + serialized payload) → keep oldest, drop rest
 *
 * Returns the cleaned queue in original FIFO order.
 */
export function deduplicateQueue(queue: OutboxRecord[]): {
  deduped: OutboxRecord[]
  dropped: number[]
} {
  const dropped: number[] = []
  const result = [...queue]

  // Pass 1: Handle localObjectId-based dedup (CREATE+DELETE → drop both; CREATE+UPDATE → merge)
  const localObjectGroups = new Map<string, OutboxRecord[]>()
  for (const r of result) {
    if (!r.localObjectId) continue
    const group = localObjectGroups.get(r.localObjectId) ?? []
    group.push(r)
    localObjectGroups.set(r.localObjectId, group)
  }

  for (const [, group] of localObjectGroups) {
    if (group.length < 2) continue
    const create = group.find(r => r.operationType === 'CREATE')
    const update = group.find(r => r.operationType === 'UPDATE')
    const del = group.find(r => r.operationType === 'DELETE')

    if (create && del) {
      // CREATE + DELETE → cancel both
      if (create.localId !== undefined) dropped.push(create.localId)
      if (del.localId !== undefined) dropped.push(del.localId)
      log.info('Dedup: CREATE+DELETE cancelados', {
        localObjectId: create.localObjectId,
        createId: create.localId,
        deleteId: del.localId,
      })
    } else if (create && update) {
      // CREATE + UPDATE → merge: keep CREATE with UPDATE's payload, drop UPDATE
      const createIdx = result.findIndex(r => r.localId === create.localId)
      if (createIdx >= 0) {
        result[createIdx] = { ...create, payload: update.payload }
      }
      if (update.localId !== undefined) dropped.push(update.localId)
      log.info('Dedup: CREATE mergeado con UPDATE', {
        localObjectId: create.localObjectId,
        updateId: update.localId,
      })
    }
  }

  // Pass 2: Exact duplicate CREATEs (same endpoint + same payload JSON) → keep oldest
  const createSignatures = new Map<string, number>() // signature → localId of oldest
  for (const r of result) {
    if (r.operationType !== 'CREATE' || r.localId === undefined) continue
    if (dropped.includes(r.localId)) continue
    const sig = `${r.endpoint}|${JSON.stringify(r.payload)}`
    const existing = createSignatures.get(sig)
    if (existing !== undefined) {
      // Duplicate → drop the newer one (keep oldest for FIFO)
      dropped.push(r.localId)
      log.info('Dedup: CREATE duplicado eliminado', { localId: r.localId, keptId: existing })
    } else {
      createSignatures.set(sig, r.localId)
    }
  }

  const deduped = result.filter(r => r.localId === undefined || !dropped.includes(r.localId))
  return { deduped, dropped }
}

/**
 * Processes the pending outbox queue in FIFO order (createdAt ASC).
 * Safe to call from multiple hooks/tabs — only one instance runs at a time.
 *
 * @param apiFetch    Raw fetch adapter returning Promise<Response>
 * @param onProgress  Optional callback invoked after each record with updated stats
 */
export async function syncQueue(
  apiFetch: ApiFetchFn,
  onProgress?: (stats: QueueStats) => void
): Promise<SyncResult> {
  if (isSyncing) {
    log.debug('Sincronización ya en curso — omitida')
    return { processed: 0, succeeded: 0, failedRetryable: 0, failedPermanent: 0, skipped: 1 }
  }

  isSyncing = true
  const correlationId = newCorrelationId()
  log.info('Iniciando sincronización de cola FIFO', { correlationId })

  const result: SyncResult = {
    processed: 0,
    succeeded: 0,
    failedRetryable: 0,
    failedPermanent: 0,
    skipped: 0,
  }

  try {
    const rawQueue = await getPendingQueue()
    log.info(`Cola pendiente: ${rawQueue.length} elemento(s)`, { correlationId })

    // Dedup before processing
    const { deduped, dropped } = deduplicateQueue(rawQueue)

    // Remove dropped records from IDB (they were cancelled by dedup)
    for (const localId of dropped) {
      await removeQueueItem(localId).catch(err =>
        log.error('Error al eliminar registro deduplicado', { localId, err })
      )
      result.skipped++
    }

    if (dropped.length > 0) {
      log.info(`Deduplicación: ${dropped.length} registro(s) eliminado(s)`, { correlationId })
    }

    for (const record of deduped) {
      if (record.localId === undefined) {
        result.skipped++
        log.warn('Registro sin localId — omitido', { correlationId })
        continue
      }

      const localId = record.localId
      result.processed++
      log.debug('Procesando registro', {
        correlationId,
        localId,
        operationType: record.operationType,
        endpoint: record.endpoint,
        correlationIdRecord: record.correlationId,
      })

      try {
        await markSyncing(localId)

        const res = await apiFetch(record.endpoint, {
          method: record.method,
          body: record.method !== 'DELETE' ? JSON.stringify(record.payload) : undefined,
          headers: {
            'Content-Type': 'application/json',
            // Signal to service worker: bypass offline-202 interception
            'X-Sync-Engine': '1',
            // Pass correlation ID for server-side tracing if supported
            'X-Correlation-Id': record.correlationId ?? correlationId,
          },
        })

        if (res.ok) {
          // 2xx → success
          await markDone(localId)
          result.succeeded++
          log.info('Registro sincronizado exitosamente', {
            correlationId,
            localId,
            status: res.status,
            operationType: record.operationType,
          })
        } else if (res.status === 404 || res.status === 409) {
          // Conflict — permanently failed, mark with conflict flag
          const errorText = await res.text().catch(() => `HTTP ${res.status}`)
          await markFailedPermanent(localId, `HTTP ${res.status}: ${errorText}`, true)
          result.failedPermanent++
          log.warn('Conflicto detectado (404/409) — marcado permanente con conflict=true', {
            correlationId,
            localId,
            status: res.status,
          })
        } else if (res.status >= 400 && res.status < 500) {
          // Other 4xx → permanent failure (bad request, never retry)
          const errorText = await res.text().catch(() => `HTTP ${res.status}`)
          await markFailedPermanent(localId, `HTTP ${res.status}: ${errorText}`, false)
          result.failedPermanent++
          log.warn('Fallo permanente (4xx) — no se reintentará', {
            correlationId,
            localId,
            status: res.status,
          })
        } else {
          // 5xx → retryable server error
          const errorText = await res.text().catch(() => `HTTP ${res.status}`)
          await markFailedRetryable(localId, `HTTP ${res.status}: ${errorText}`)
          result.failedRetryable++
          log.warn('Error de servidor (5xx) — se reintentará', {
            correlationId,
            localId,
            status: res.status,
          })
        }
      } catch (err) {
        // TypeError (network failure) or unexpected → retryable
        const errorMsg = err instanceof Error ? err.message : String(err)
        await markFailedRetryable(localId, errorMsg)
        result.failedRetryable++
        log.error('Error de red al sincronizar registro', { correlationId, localId, error: errorMsg })
      }

      // Notify progress after each record
      if (onProgress) {
        try {
          const stats = await getQueueStats()
          onProgress(stats)
        } catch {
          // Progress callback errors are non-fatal
        }
      }
    }

    // Comprehensive cleanup: done (7d) + failed_permanent (7d) + max 1000
    await cleanupQueue()

    log.info('Sincronización completada', { correlationId, ...result })
  } catch (err) {
    log.error('Error inesperado en sync engine', { correlationId, err })
  } finally {
    isSyncing = false
  }

  return result
}
