/**
 * Queue optimization engine for the conductivity offline outbox.
 * Reduces redundant operations BEFORE sync to prevent duplicates
 * and unnecessary server requests.
 *
 * Supersedes the inline deduplicateQueue() in the sync engine with
 * a more comprehensive set of rules:
 *
 *   1. CREATE + DELETE (same resource) → REMOVE BOTH
 *   2. CREATE + UPDATE (same resource) → MERGE payload INTO CREATE
 *   3. UPDATE + UPDATE (same resource) → KEEP LAST UPDATE only
 *   4. UPDATE + DELETE (same resource) → KEEP DELETE only
 *   5. Exact duplicate CREATEs (same endpoint + payload) → keep oldest
 *
 * Grouping key:
 *   - Records with non-null resourceId → `res:${resourceId}`
 *   - Records without resourceId       → `local:${localObjectId}` or unique fallback
 *
 * @module conductivityQueueOptimizer
 * @dependencies @/types/conductivityOffline, @/lib/logger
 * @example
 *   const { optimized, dropped } = optimizeQueue(rawQueue)
 */

import type { OutboxRecord, OptimizeResult } from '@/types/conductivityOffline'
import { createLogger } from '@/lib/logger'

const log = createLogger('conductivityQueueOptimizer')

/** Derives a stable grouping key for dedup/optimization. */
function getGroupKey(record: OutboxRecord): string {
  if (record.resourceId) return `res:${record.resourceId}`
  if (record.localObjectId) return `local:${record.localObjectId}`
  return `unique:${record.localId ?? record.createdAt}`
}

/**
 * Optimizes the outbox queue by collapsing redundant operations on
 * the same resource. Returns the optimized list and IDs to remove.
 *
 * The returned `optimized` array preserves chronological order.
 */
export function optimizeQueue(queue: OutboxRecord[]): OptimizeResult {
  if (queue.length <= 1) return { optimized: [...queue], dropped: [] }

  const dropped: number[] = []

  const groups = new Map<string, OutboxRecord[]>()
  for (const record of queue) {
    const key = getGroupKey(record)
    const group = groups.get(key) ?? []
    group.push(record)
    groups.set(key, group)
  }

  const optimized: OutboxRecord[] = []

  for (const [groupKey, group] of groups) {
    if (group.length === 1) {
      optimized.push(group[0])
      continue
    }

    group.sort((a, b) => a.createdAt - b.createdAt)

    const creates = group.filter(r => r.operationType === 'CREATE')
    const updates = group.filter(r => r.operationType === 'UPDATE')
    const deletes = group.filter(r => r.operationType === 'DELETE')

    // Rule 1: CREATE + DELETE → cancel both — the record never needs to exist on the server
    if (creates.length > 0 && deletes.length > 0) {
      for (const r of group) {
        if (r.localId !== undefined) dropped.push(r.localId)
      }
      log.info('Optimización: CREATE+DELETE cancelados', {
        groupKey,
        createId: creates[0].localId,
        deleteId: deletes[deletes.length - 1].localId,
        totalDropped: group.length,
      })
      continue
    }

    // Rule 2: CREATE + UPDATE(s) → merge last UPDATE payload into CREATE, drop UPDATEs
    if (creates.length > 0 && updates.length > 0) {
      const create = creates[0]
      const lastUpdate = updates[updates.length - 1]

      const merged: OutboxRecord = {
        ...create,
        payload: {
          ...(create.payload as Record<string, unknown>),
          ...(lastUpdate.payload as Record<string, unknown>),
        },
      }
      optimized.push(merged)

      for (const r of group) {
        if (r !== create && r.localId !== undefined) dropped.push(r.localId)
      }
      log.info('Optimización: CREATE fusionado con UPDATE(s)', {
        groupKey,
        createId: create.localId,
        mergedUpdates: updates.length,
      })
      continue
    }

    // Rule 4: UPDATE(s) + DELETE → keep only the last DELETE
    if (updates.length > 0 && deletes.length > 0 && creates.length === 0) {
      const lastDelete = deletes[deletes.length - 1]
      optimized.push(lastDelete)

      for (const r of group) {
        if (r !== lastDelete && r.localId !== undefined) dropped.push(r.localId)
      }
      log.info('Optimización: UPDATE(s)+DELETE reducidos a DELETE', {
        groupKey,
        keptDeleteId: lastDelete.localId,
        droppedCount: group.length - 1,
      })
      continue
    }

    // Rule 3: multiple UPDATEs → keep only the last one
    if (updates.length > 1 && deletes.length === 0) {
      const lastUpdate = updates[updates.length - 1]
      optimized.push(lastUpdate)

      for (const r of group) {
        if (r !== lastUpdate && r.localId !== undefined) dropped.push(r.localId)
      }
      log.info('Optimización: múltiples UPDATE reducidos a uno', {
        groupKey,
        keptId: lastUpdate.localId,
        droppedCount: updates.length - 1,
      })
      continue
    }

    // No rule matched — keep all records in this group
    optimized.push(...group)
  }

  // Pass 2: exact duplicate CREATEs (same endpoint + serialized payload) → keep oldest
  const createSignatures = new Map<string, number>()
  const duplicateCreateIds: number[] = []

  for (const r of optimized) {
    if (r.operationType !== 'CREATE' || r.localId === undefined) continue
    if (dropped.includes(r.localId)) continue

    const sig = `${r.endpoint}|${JSON.stringify(r.payload)}`
    const existing = createSignatures.get(sig)
    if (existing !== undefined) {
      duplicateCreateIds.push(r.localId)
      dropped.push(r.localId)
      log.info('Optimización: CREATE duplicado eliminado', { localId: r.localId, keptId: existing })
    } else {
      createSignatures.set(sig, r.localId)
    }
  }

  const final = optimized.filter(
    r => r.localId === undefined || !duplicateCreateIds.includes(r.localId)
  )

  final.sort((a, b) => a.createdAt - b.createdAt)

  if (dropped.length > 0) {
    log.info('Cola optimizada', { before: queue.length, after: final.length, dropped: dropped.length })
  }

  return { optimized: final, dropped }
}
