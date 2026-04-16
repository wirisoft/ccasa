/**
 * In-memory cache for conductivity records used by the optimistic UI layer.
 * Holds the merged view of server-fetched records + local pending records.
 *
 * Lifecycle:
 *   1. setRecords() — called after every successful fetchRecords()
 *   2. addLocalRecord() — called on optimistic CREATE (before server confirms)
 *   3. updateRecord() — called on optimistic UPDATE
 *   4. removeRecord() — called on optimistic DELETE
 *   5. setRecords() again when server data arrives — clears all local entries
 *
 * @module conductivityLocalStore
 * @dependencies @/lib/ccasa/types, @/types/conductivityOffline, @/lib/logger
 * @example
 *   setRecords(serverData)
 *   addLocalRecord({ conductivityId: -Date.now(), isLocal: true, ... })
 *   const all = getRecords() // server + local mixed
 */

import { createLogger } from '@/lib/logger'
import type { ConductivityRecord } from '@/lib/ccasa/types'
import type { LocalRecordMeta } from '@/types/conductivityOffline'

const log = createLogger('conductivityLocalStore')

export type LocalConductivityRecord = ConductivityRecord & LocalRecordMeta

/** Module-level in-memory store. Resets on full page reload. */
let store: LocalConductivityRecord[] = []

/**
 * Replaces the entire store with a new set of server-fetched records.
 * Preserves any local (isLocal=true) records that have not yet been confirmed.
 */
export function setRecords(serverRecords: ConductivityRecord[]): void {
  const localPending = store.filter(r => r.isLocal === true)
  store = [
    ...serverRecords.map(r => ({ ...r, isLocal: false, tempId: undefined })),
    ...localPending,
  ]
  log.debug('Store actualizado', { total: store.length, localPending: localPending.length })
}

/** Returns a shallow copy of the current store (server + local). */
export function getRecords(): LocalConductivityRecord[] {
  return [...store]
}

/**
 * Adds a local-only record (optimistic CREATE).
 * Use a negative conductivityId to avoid collisions with server IDs.
 */
export function addLocalRecord(record: LocalConductivityRecord): void {
  store = [...store, record]
  log.debug('Registro local añadido optimistamente', {
    tempId: record.tempId,
    conductivityId: record.conductivityId,
  })
}

/**
 * Updates a record in-place by conductivityId.
 * Works for both server and local records.
 */
export function updateRecord(
  conductivityId: number,
  changes: Partial<ConductivityRecord>
): void {
  store = store.map(r =>
    r.conductivityId === conductivityId ? { ...r, ...changes } : r
  )
  log.debug('Registro actualizado en store', { conductivityId })
}

/**
 * Removes a record from the store by conductivityId.
 * Used for optimistic DELETE.
 */
export function removeRecord(conductivityId: number): void {
  store = store.filter(r => r.conductivityId !== conductivityId)
  log.debug('Registro eliminado del store', { conductivityId })
}

/**
 * Replaces a local optimistic record (matched by tempId) with the
 * confirmed server record after a successful sync.
 */
export function confirmLocalRecord(tempId: string, serverRecord: ConductivityRecord): void {
  store = store.map(r =>
    r.tempId === tempId
      ? { ...serverRecord, isLocal: false, tempId: undefined }
      : r
  )
  log.debug('Registro local confirmado por servidor', { tempId, conductivityId: serverRecord.conductivityId })
}

/**
 * Marks a local record as permanently failed (e.g., could not be synced).
 * The record stays in the UI with a visual error indicator.
 */
export function markLocalFailed(tempId: string): void {
  store = store.map(r =>
    r.tempId === tempId ? { ...r, isLocal: true } : r
  )
  log.warn('Registro local marcado como fallido', { tempId })
}

/** Removes all local (isLocal=true) records from the store. */
export function clearLocalRecords(): void {
  const before = store.length
  store = store.filter(r => !r.isLocal)
  log.debug('Registros locales limpiados', { removed: before - store.length })
}

/** Returns only the records marked as local (isLocal=true, pending sync). */
export function getLocalPendingRecords(): LocalConductivityRecord[] {

  return store.filter(r => r.isLocal === true)
}

/** Removes a local record by its tempId (used after sync confirms the CREATE). */
export function removeLocalByTempId(tempId: string): void {

  const before = store.length

  store = store.filter(r => r.tempId !== tempId)

  if (store.length < before) {
    log.debug('Registro local eliminado por tempId', { tempId })
  }
}

/**
 * Replaces the entire store with an already-merged list of records.
 * Unlike setRecords(), this does NOT re-append isLocal records —
 * the caller is responsible for including them in the input.
 */
export function setMergedStore(records: LocalConductivityRecord[]): void {

  store = [...records]

  log.debug('Store reemplazado con merge', { total: store.length })
}
