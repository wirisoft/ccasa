/**
 * IndexedDB persistence layer for the conductivity offline queue and logbook cache.
 * Uses the 'idb' library for promise-based access.
 *
 * DB name : ccasa_conductivity_offline_v2
 * Stores  :
 *   conductivity_outbox — FIFO queue of pending CRUD operations
 *   meta               — key-value store for cached API responses (logbooks)
 *
 * @module conductivityOfflineDb
 * @dependencies idb, @/types/conductivityOffline, @/lib/logger
 * @example
 *   const id = await enqueue({ operationType: 'CREATE', payload: body, ... })
 *   const queue = await getPendingQueue()
 *   const stats = await getQueueStats()
 */

import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'

import { createLogger } from '@/lib/logger'
import type { LogbookCache, OutboxRecord, QueueStats } from '@/types/conductivityOffline'

const log = createLogger('conductivityOfflineDb')

const DB_NAME = 'ccasa_conductivity_offline_v2'
const DB_VERSION = 1
const STORE_OUTBOX = 'conductivity_outbox'
const STORE_META = 'meta'
const META_LOGBOOKS_KEY = 'logbooks_cache_v2'

/** Singleton — opens only once per page lifetime. */
let dbPromise: Promise<IDBPDatabase> | null = null

/**
 * Returns the singleton IDB database instance.
 * Creates stores and indexes on first call (DB upgrade).
 */
export function getDB(): Promise<IDBPDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        const outbox = db.createObjectStore(STORE_OUTBOX, {
          keyPath: 'localId',
          autoIncrement: true,
        })
        outbox.createIndex('by-status', 'status')
        outbox.createIndex('by-createdAt', 'createdAt')
        outbox.createIndex('by-operation', 'operationType')
        log.info('Store conductivity_outbox creado con índices')
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
        log.info('Store meta creado')
      }
    },
  }).catch(err => {
    log.error('Error al abrir IndexedDB', err)
    dbPromise = null // reset so next call retries
    throw err
  })

  return dbPromise
}

/**
 * Adds a new operation to the outbox FIFO queue.
 * Automatically sets: status='pending', retryCount=0, timestamps.
 * Returns the auto-incremented localId.
 */
export async function enqueue(
  record: Omit<OutboxRecord, 'localId' | 'status' | 'retryCount' | 'lastError' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  try {
    const db = await getDB()
    const now = Date.now()
    const entry: Omit<OutboxRecord, 'localId'> = {
      ...record,
      status: 'pending',
      retryCount: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    }
    const localId = (await db.add(STORE_OUTBOX, entry)) as number
    log.info('Registro encolado', {
      localId,
      operationType: record.operationType,
      endpoint: record.endpoint,
    })
    return localId
  } catch (err) {
    log.error('Error al encolar registro', err)
    throw err
  }
}

/**
 * Returns all records with status 'pending' or 'failed_retryable',
 * ordered by createdAt ASC (FIFO — oldest first).
 */
export async function getPendingQueue(): Promise<OutboxRecord[]> {
  try {
    const db = await getDB()
    const all = (await db.getAll(STORE_OUTBOX)) as OutboxRecord[]
    return all
      .filter(r => r.status === 'pending' || r.status === 'failed_retryable')
      .sort((a, b) => a.createdAt - b.createdAt)
  } catch (err) {
    log.error('Error al obtener cola pendiente', err)
    return []
  }
}

/** Transitions a record to 'syncing' status. */
export async function markSyncing(localId: number): Promise<void> {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_OUTBOX, 'readwrite')
    const record = (await tx.store.get(localId)) as OutboxRecord | undefined
    if (!record) return
    await tx.store.put({ ...record, status: 'syncing', updatedAt: Date.now() })
    await tx.done
    log.debug('Marcado como syncing', { localId })
  } catch (err) {
    log.error('Error al marcar syncing', { localId, err })
  }
}

/** Transitions a record to 'done' (server confirmed receipt). */
export async function markDone(localId: number): Promise<void> {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_OUTBOX, 'readwrite')
    const record = (await tx.store.get(localId)) as OutboxRecord | undefined
    if (!record) return
    await tx.store.put({ ...record, status: 'done', updatedAt: Date.now() })
    await tx.done
    log.info('Registro sincronizado (done)', { localId })
  } catch (err) {
    log.error('Error al marcar done', { localId, err })
  }
}

/**
 * Marks a record as failed-retryable, incrementing retryCount.
 * If retryCount >= maxRetries, promotes automatically to failed_permanent.
 */
export async function markFailedRetryable(localId: number, error: string): Promise<void> {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_OUTBOX, 'readwrite')
    const record = (await tx.store.get(localId)) as OutboxRecord | undefined
    if (!record) return
    const newRetryCount = record.retryCount + 1
    const isPermanent = newRetryCount >= record.maxRetries
    const newStatus = isPermanent ? 'failed_permanent' : 'failed_retryable'
    await tx.store.put({
      ...record,
      status: newStatus,
      retryCount: newRetryCount,
      lastError: error,
      updatedAt: Date.now(),
    })
    await tx.done
    if (isPermanent) {
      log.warn('Registro promovido a fallo permanente (máx reintentos alcanzados)', {
        localId,
        newRetryCount,
      })
    } else {
      log.warn('Fallo reintentable registrado', { localId, newRetryCount, error })
    }
  } catch (err) {
    log.error('Error al marcar failed_retryable', { localId, err })
  }
}

/**
 * Directly marks a record as permanently failed.
 * @param conflict true when the failure is a 404/409 server conflict
 */
export async function markFailedPermanent(
  localId: number,
  error: string,
  conflict = false
): Promise<void> {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_OUTBOX, 'readwrite')
    const record = (await tx.store.get(localId)) as OutboxRecord | undefined
    if (!record) return
    await tx.store.put({
      ...record,
      status: 'failed_permanent',
      lastError: error,
      conflict,
      updatedAt: Date.now(),
    })
    await tx.done
    log.warn('Registro marcado como fallo permanente', { localId, error, conflict })
  } catch (err) {
    log.error('Error al marcar failed_permanent', { localId, err })
  }
}

/** Returns aggregate counts by status. */
export async function getQueueStats(): Promise<QueueStats> {
  try {
    const db = await getDB()
    const all = (await db.getAll(STORE_OUTBOX)) as OutboxRecord[]
    const stats: QueueStats = {
      pending: 0,
      syncing: 0,
      failedRetryable: 0,
      failedPermanent: 0,
      done: 0,
      total: all.length,
    }
    for (const r of all) {
      if (r.status === 'pending') stats.pending++
      else if (r.status === 'syncing') stats.syncing++
      else if (r.status === 'failed_retryable') stats.failedRetryable++
      else if (r.status === 'failed_permanent') stats.failedPermanent++
      else if (r.status === 'done') stats.done++
    }
    return stats
  } catch (err) {
    log.error('Error al obtener estadísticas de cola', err)
    return { pending: 0, syncing: 0, failedRetryable: 0, failedPermanent: 0, done: 0, total: 0 }
  }
}

/**
 * Deletes 'done' records from the outbox.
 * @param olderThanMs - If provided, only deletes records where updatedAt < (now - olderThanMs)
 * @returns Number of deleted records
 */
export async function clearDoneRecords(olderThanMs?: number): Promise<number> {
  try {
    const db = await getDB()
    const all = (await db.getAll(STORE_OUTBOX)) as OutboxRecord[]
    const cutoff = olderThanMs !== undefined ? Date.now() - olderThanMs : null
    const toDelete = all.filter(
      r => r.status === 'done' && (cutoff === null || r.updatedAt < cutoff)
    )
    if (toDelete.length === 0) return 0
    const tx = db.transaction(STORE_OUTBOX, 'readwrite')
    for (const r of toDelete) {
      if (r.localId !== undefined) {
        await tx.store.delete(r.localId)
      }
    }
    await tx.done
    log.info('Registros completados eliminados de la cola', { count: toDelete.length })
    return toDelete.length
  } catch (err) {
    log.error('Error al limpiar registros completados', err)
    return 0
  }
}

/**
 * Saves the logbooks list to the meta cache with a 24h expiry.
 */
export async function saveLogbooksCache(data: LogbookCache['data']): Promise<void> {
  try {
    const db = await getDB()
    const now = Date.now()
    const entry = {
      key: META_LOGBOOKS_KEY,
      data: Array.isArray(data) ? data : [],
      fetchedAt: now,
      expiresAt: now + 86_400_000, // 24 hours
    }
    await db.put(STORE_META, entry)
    log.debug('Caché de bitácoras guardada', { count: data.length })
  } catch (err) {
    log.error('Error al guardar caché de bitácoras', err)
  }
}

/**
 * Returns the cached logbook list.
 * Returns null if not found or if the cache has expired.
 */
export async function getLogbooksCache(): Promise<LogbookCache | null> {
  try {
    const db = await getDB()
    const row = (await db.get(STORE_META, META_LOGBOOKS_KEY)) as
      | ({ key: string } & LogbookCache)
      | undefined
    if (!row) return null
    if (row.expiresAt < Date.now()) {
      log.debug('Caché de bitácoras expirada')
      return null
    }
    return { data: row.data, fetchedAt: row.fetchedAt, expiresAt: row.expiresAt }
  } catch (err) {
    log.error('Error al leer caché de bitácoras', err)
    return null
  }
}

/**
 * Returns all records with status 'failed_permanent', ordered by createdAt DESC.
 * Used by the Failed Operations UI section.
 */
export async function listFailedPermanent(): Promise<OutboxRecord[]> {
  try {
    const db = await getDB()
    const all = (await db.getAll(STORE_OUTBOX)) as OutboxRecord[]
    return all
      .filter(r => r.status === 'failed_permanent')
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch (err) {
    log.error('Error al listar registros fallidos permanentes', err)
    return []
  }
}

/**
 * Removes a specific record from the queue by localId.
 * Used to dismiss failed records from the UI.
 */
export async function removeQueueItem(localId: number): Promise<void> {
  try {
    const db = await getDB()
    await db.delete(STORE_OUTBOX, localId)
    log.info('Registro eliminado de la cola', { localId })
  } catch (err) {
    log.error('Error al eliminar registro de la cola', { localId, err })
    throw err
  }
}

/**
 * Resets a failed record back to 'pending' so it will be retried on next sync.
 * Resets retryCount to 0 and clears lastError.
 */
export async function resetToRetry(localId: number): Promise<void> {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_OUTBOX, 'readwrite')
    const record = (await tx.store.get(localId)) as OutboxRecord | undefined
    if (!record) return
    await tx.store.put({
      ...record,
      status: 'pending',
      retryCount: 0,
      lastError: null,
      conflict: false,
      updatedAt: Date.now(),
    })
    await tx.done
    log.info('Registro reiniciado para reintento', { localId })
  } catch (err) {
    log.error('Error al reiniciar registro', { localId, err })
    throw err
  }
}

/**
 * Comprehensive queue cleanup:
 *   1. Removes 'done' records older than olderThanMs (default 7 days)
 *   2. Removes 'failed_permanent' records older than failedOlderThanMs (default 7 days)
 *   3. Enforces maxQueueSize — drops oldest 'pending' if over limit
 *
 * @returns Summary of removed counts
 */
export async function cleanupQueue(
  olderThanMs = 7 * 24 * 60 * 60 * 1000,
  maxQueueSize = 1000
): Promise<{ removedDone: number; removedFailedPermanent: number; total: number }> {
  let removedDone = 0
  let removedFailedPermanent = 0

  try {
    const db = await getDB()
    const all = (await db.getAll(STORE_OUTBOX)) as OutboxRecord[]
    const cutoff = Date.now() - olderThanMs
    const toDelete: number[] = []

    for (const r of all) {
      if (r.localId === undefined) continue
      if (r.status === 'done' && r.updatedAt < cutoff) {
        toDelete.push(r.localId)
        removedDone++
      } else if (r.status === 'failed_permanent' && r.updatedAt < cutoff) {
        toDelete.push(r.localId)
        removedFailedPermanent++
      }
    }

    // Enforce max queue size: drop oldest pending if needed
    const remaining = all.filter(r => r.localId !== undefined && !toDelete.includes(r.localId!))
    if (remaining.length > maxQueueSize) {
      const excess = remaining
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(0, remaining.length - maxQueueSize)
      for (const r of excess) {
        if (r.localId !== undefined) toDelete.push(r.localId)
      }
    }

    if (toDelete.length > 0) {
      const tx = db.transaction(STORE_OUTBOX, 'readwrite')
      for (const id of toDelete) await tx.store.delete(id)
      await tx.done
      log.info('Limpieza de cola ejecutada', { removedDone, removedFailedPermanent, total: toDelete.length })
    }

    return { removedDone, removedFailedPermanent, total: toDelete.length }
  } catch (err) {
    log.error('Error durante limpieza de cola', err)
    return { removedDone, removedFailedPermanent, total: 0 }
  }
}

/** Escapes single quotes for SQL string literals. */
function sqlQuoteString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

/**
 * Generates a SQL dump (CREATE TABLE + INSERTs) of all non-done records.
 * Useful for audit and offline debugging. Does not execute anything.
 */
export async function exportQueueAsSQL(): Promise<string> {
  try {
    const db = await getDB()
    const all = (await db.getAll(STORE_OUTBOX)) as OutboxRecord[]
    const rows = all.filter(r => r.status !== 'done')

    if (rows.length === 0) {
      return '-- Cola de conductividad vacía\n'
    }

    const header =
      `-- ccasa conductividad pendiente (exportado ${new Date().toISOString()})\n` +
      `CREATE TABLE IF NOT EXISTS conductivity_outbox (\n` +
      `  local_id INTEGER PRIMARY KEY,\n` +
      `  operation_type TEXT NOT NULL,\n` +
      `  resource_id TEXT,\n` +
      `  endpoint TEXT NOT NULL,\n` +
      `  method TEXT NOT NULL,\n` +
      `  status TEXT NOT NULL,\n` +
      `  retry_count INTEGER NOT NULL,\n` +
      `  max_retries INTEGER NOT NULL,\n` +
      `  last_error TEXT,\n` +
      `  created_at INTEGER NOT NULL,\n` +
      `  updated_at INTEGER NOT NULL,\n` +
      `  payload_json TEXT NOT NULL\n` +
      `);\n\n`

    const inserts = rows.map(r => {
      const payloadJson = JSON.stringify(r.payload)
      return (
        `INSERT INTO conductivity_outbox ` +
        `(local_id, operation_type, resource_id, endpoint, method, status, retry_count, max_retries, last_error, created_at, updated_at, payload_json) VALUES (` +
        `${r.localId ?? 'NULL'}, ` +
        `${sqlQuoteString(r.operationType)}, ` +
        `${r.resourceId ? sqlQuoteString(r.resourceId) : 'NULL'}, ` +
        `${sqlQuoteString(r.endpoint)}, ` +
        `${sqlQuoteString(r.method)}, ` +
        `${sqlQuoteString(r.status)}, ` +
        `${r.retryCount}, ` +
        `${r.maxRetries}, ` +
        `${r.lastError ? sqlQuoteString(r.lastError) : 'NULL'}, ` +
        `${r.createdAt}, ` +
        `${r.updatedAt}, ` +
        `${sqlQuoteString(payloadJson)}` +
        `);`
      )
    })

    return header + inserts.join('\n') + '\n'
  } catch (err) {
    log.error('Error al exportar cola como SQL', err)
    return `-- Error al exportar: ${err instanceof Error ? err.message : String(err)}\n`
  }
}

/**
 * Generates a SQL dump and triggers a browser file download.
 */
export async function downloadSQLExport(): Promise<void> {
  try {
    const sql = await exportQueueAsSQL()
    const blob = new Blob([sql], { type: 'application/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conductividad-cola-${new Date().toISOString().slice(0, 10)}.sql`
    a.click()
    URL.revokeObjectURL(url)
    log.info('Exportación SQL descargada')
  } catch (err) {
    log.error('Error al descargar exportación SQL', err)
    throw err
  }
}
