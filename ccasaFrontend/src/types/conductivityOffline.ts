/**
 * Shared TypeScript types for the conductivity offline/PWA layer.
 * Single source of truth — import from here across all offline files.
 *
 * @module conductivityOffline
 * @dependencies @/lib/ccasa/types (for LogbookDTO)
 * @example
 *   import type { OutboxRecord, QueueStats, ApiFetchFn } from '@/types/conductivityOffline'
 */

import type { LogbookDTO } from '@/lib/ccasa/types'

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE'

export type OutboxStatus =
  | 'pending'
  | 'syncing'
  | 'failed_retryable'
  | 'failed_permanent'
  | 'done'

export interface OutboxRecord {

  /** IDB auto-increment key. Undefined until persisted. */
  localId?: number
  operationType: OperationType

  /** null for CREATE; real server ID for UPDATE/DELETE */
  resourceId: string | null

  /** Request body — typed as unknown, cast at usage site */
  payload: unknown

  /** e.g. '/api/v1/conductivity-records' */
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  status: OutboxStatus
  retryCount: number

  /** Default 5 */
  maxRetries: number
  lastError: string | null

  /** Date.now() at enqueue time */
  createdAt: number
  updatedAt: number

  /**
   * True when the failure was caused by a 404 or 409 conflict.
   * UI should show a conflict indicator instead of a generic error.
   */
  conflict?: boolean

  /**
   * UUID generated at enqueue time.
   * Used to correlate log entries across the DB, sync engine, and UI.
   */
  correlationId?: string

  /**
   * Client-side object identifier shared across related operations on the
   * same local (not-yet-synced) record. Enables deduplication:
   *   CREATE + UPDATE (same localObjectId) → merge into one CREATE
   *   CREATE + DELETE (same localObjectId) → drop both
   */
  localObjectId?: string
}

export interface QueueStats {
  pending: number
  syncing: number
  failedRetryable: number
  failedPermanent: number
  done: number
  total: number
}

export interface SyncResult {
  processed: number
  succeeded: number
  failedRetryable: number
  failedPermanent: number
  skipped: number
}

export interface LogbookCache {

  /** Cached logbook list */
  data: LogbookDTO[]

  /** Unix ms when data was fetched */
  fetchedAt: number

  /** fetchedAt + 24h in ms — cache expires after this */
  expiresAt: number
}

/**
 * Raw-fetch adapter used by the sync engine.
 * Returns Promise<Response> so the engine can inspect HTTP status codes.
 *
 * NOTE: This is NOT the project's apiFetch<T> (which returns Promise<T>).
 * Create via makeSyncApiFetch(token) in ConductivityPanel.
 */
export type ApiFetchFn = (url: string, options?: RequestInit) => Promise<Response>

/** Result of a queue cleanup operation. */
export interface CleanupResult {
  removedDone: number
  removedFailedPermanent: number
  total: number
}

/**
 * Describes a change applied by the sync engine after a successful operation.
 * Used for tempId reconciliation and direct store updates.
 */
export interface SyncAppliedChange {
  localId: number
  operationType: OperationType
  resourceId: string | null

  /** The server-assigned record returned after a successful CREATE. */
  serverRecord?: Record<string, unknown>
  localObjectId?: string
}

/** Result of the queue optimizer — optimized records + IDs to remove from IDB. */
export interface OptimizeResult {
  optimized: OutboxRecord[]
  dropped: number[]
}

/**
 * Extends ConductivityRecord with local-only fields for optimistic UI.
 * Records with isLocal=true are shown immediately in the table before
 * the server confirms them. They are replaced when fetchRecords runs.
 */
export interface LocalRecordMeta {

  /** True while this record exists only in the local queue (not yet confirmed by server). */
  isLocal?: boolean

  /** Client-generated negative ID used as a React key until server ID is known. */
  tempId?: string
}
