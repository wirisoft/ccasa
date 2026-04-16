/**
 * Safe merge strategy for server data + local pending records.
 * Prevents data loss when a fetchRecords() brings server state that
 * conflicts with locally enqueued operations.
 *
 * Rules:
 *   - Server records with a pending DELETE in the outbox → excluded
 *   - Server records with a pending UPDATE in the outbox → local payload wins
 *   - Local CREATE records (isLocal=true)                → preserved
 *   - Everything else from server                        → used as-is
 *
 * @module conductivityMerge
 * @dependencies @/types/conductivityOffline, @/lib/ccasa/conductivityLocalStore, @/lib/logger
 * @example
 *   const merged = mergeServerWithLocal(serverList, localPending, pendingQueue)
 */

import { createLogger } from '@/lib/logger'
import type { ConductivityRecord } from '@/lib/ccasa/types'
import type { OutboxRecord } from '@/types/conductivityOffline'
import type { LocalConductivityRecord } from '@/lib/ccasa/conductivityLocalStore'

const log = createLogger('conductivityMerge')

/**
 * Merges server-fetched records with local pending state to produce
 * a consistent view that does not lose unsynced changes.
 *
 * @param serverRecords   Records returned by the API
 * @param localPending    Records in the local store with isLocal=true
 * @param pendingQueue    Current outbox (pending + failed_retryable)
 */
export function mergeServerWithLocal(
  serverRecords: ConductivityRecord[],
  localPending: LocalConductivityRecord[],
  pendingQueue: OutboxRecord[]
): LocalConductivityRecord[] {
  try {
    const pendingDeletes = new Set<string>()
    const pendingUpdates = new Map<string, OutboxRecord>()

    for (const op of pendingQueue) {
      if (!op.resourceId) continue

      if (op.operationType === 'DELETE') {
        pendingDeletes.add(op.resourceId)
      }

      if (op.operationType === 'UPDATE') {
        pendingUpdates.set(op.resourceId, op)
      }
    }

    const merged: LocalConductivityRecord[] = []

    for (const serverRec of serverRecords) {
      const resId = String(serverRec.conductivityId)

      if (pendingDeletes.has(resId)) {
        log.debug('Merge: registro servidor excluido (DELETE pendiente)', { resId })
        continue
      }

      if (pendingUpdates.has(resId)) {
        const updateOp = pendingUpdates.get(resId)!
        const localChanges = updateOp.payload as Record<string, unknown>

        merged.push({
          ...serverRec,
          ...localChanges,
          conductivityId: serverRec.conductivityId,
          isLocal: false,
          tempId: undefined,
        } as LocalConductivityRecord)
        log.debug('Merge: registro servidor con UPDATE local aplicado', { resId })
        continue
      }

      merged.push({ ...serverRec, isLocal: false, tempId: undefined })
    }

    for (const local of localPending) {
      merged.push(local)
    }

    log.debug('Merge completado', {
      server: serverRecords.length,
      localPending: localPending.length,
      pendingDeletes: pendingDeletes.size,
      pendingUpdates: pendingUpdates.size,
      result: merged.length,
    })

    return merged
  } catch (err) {
    log.error('Error en merge — fallback a servidor + locales', err)

    return [
      ...serverRecords.map(r => ({ ...r, isLocal: false, tempId: undefined } as LocalConductivityRecord)),
      ...localPending,
    ]
  }
}
