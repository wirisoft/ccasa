/**
 * Almacenamiento local para conductividad en la PWA: cola FIFO (IndexedDB)
 * y caché de bitácoras para poder completar el formulario sin red.
 *
 * IndexedDB sustituye a SQLite embebido (sin dependencias WASM): el navegador
 * persiste los datos en disco del cliente de forma análoga a un .db local.
 */

import type { CreateConductivityRequest, LogbookDTO } from '@/lib/ccasa/types'

const DB_NAME = 'ccasa_conductivity_offline_v1'
const DB_VERSION = 1

const STORE_OUTBOX = 'conductivity_outbox'
const STORE_META = 'meta'

const META_LOGBOOKS_KEY = 'logbooks_v1'

/** Un elemento en la cola de envío (orden real = FIFO por `createdAt`). */
export interface ConductivityOutboxRecord {
  localId: string
  createdAt: number

  /** Reservado para futuras extensiones; hoy solo se usa `pending`. */
  syncStatus: 'pending'
  payload: CreateConductivityRequest
}

interface MetaLogbooksRow {
  key: typeof META_LOGBOOKS_KEY
  updatedAt: number
  logbooks: LogbookDTO[]
}

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error('IndexedDB no disponible'))
  }

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onerror = () => reject(req.error ?? new Error('Error al abrir IndexedDB'))

    req.onsuccess = () => resolve(req.result)

    req.onupgradeneeded = () => {
      const db = req.result

      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        const outbox = db.createObjectStore(STORE_OUTBOX, { keyPath: 'localId' })

        outbox.createIndex('byCreatedAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
      }
    }
  })
}

function idbRequestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Error IndexedDB'))
  })
}

function idbTxComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Error transacción IndexedDB'))
    tx.onabort = () => reject(tx.error ?? new Error('Transacción abortada'))
  })
}

/** Lista la cola ordenada por antigüedad (primero el más viejo → FIFO). */
export async function listConductivityOutboxFifo(): Promise<ConductivityOutboxRecord[]> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_OUTBOX, 'readonly')
    const store = tx.objectStore(STORE_OUTBOX)
    const req = store.getAll()

    req.onsuccess = () => {
      const rows = (req.result as ConductivityOutboxRecord[]).filter(
        r => r && r.syncStatus === 'pending'
      )

      rows.sort((a, b) => a.createdAt - b.createdAt)

      resolve(rows)
    }

    req.onerror = () => reject(req.error ?? new Error('Error al leer cola'))
  })
}

export async function countConductivityOutboxPending(): Promise<number> {
  const rows = await listConductivityOutboxFifo()

  return rows.length
}

export async function enqueueConductivityCreate(
  payload: CreateConductivityRequest
): Promise<string> {
  const db = await openDb()

  const localId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  const record: ConductivityOutboxRecord = {
    localId,
    createdAt: Date.now(),
    syncStatus: 'pending',
    payload
  }

  const tx = db.transaction(STORE_OUTBOX, 'readwrite')

  tx.objectStore(STORE_OUTBOX).put(record)

  await idbTxComplete(tx)

  return localId
}

export async function removeConductivityOutboxItem(localId: string): Promise<void> {
  const db = await openDb()

  const tx = db.transaction(STORE_OUTBOX, 'readwrite')

  tx.objectStore(STORE_OUTBOX).delete(localId)

  await idbTxComplete(tx)
}

export async function saveLogbooksCache(logbooks: LogbookDTO[]): Promise<void> {
  const db = await openDb()

  const row: MetaLogbooksRow = {
    key: META_LOGBOOKS_KEY,
    updatedAt: Date.now(),
    logbooks: Array.isArray(logbooks) ? logbooks : []
  }

  const tx = db.transaction(STORE_META, 'readwrite')

  tx.objectStore(STORE_META).put(row)

  await idbTxComplete(tx)
}

export async function loadLogbooksCache(): Promise<LogbookDTO[] | null> {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE_META, 'readonly')
    const req = tx.objectStore(STORE_META).get(META_LOGBOOKS_KEY)
    const row = (await idbRequestToPromise(req)) as MetaLogbooksRow | undefined

    if (!row || !Array.isArray(row.logbooks)) {
      return null
    }

    return row.logbooks
  } catch {
    return null
  }
}

/**
 * Vacía la cola en orden FIFO: envía cada payload con `postCreate` y borra al tener éxito.
 * Si un envío falla, se detiene el proceso (el resto queda pendiente).
 */
export async function flushConductivityOutboxFifo(
  postCreate: (body: CreateConductivityRequest) => Promise<void>
): Promise<{ sent: number; stoppedAt?: string }> {
  const pending = await listConductivityOutboxFifo()
  let sent = 0

  for (const row of pending) {
    try {
      await postCreate(row.payload)
      await removeConductivityOutboxItem(row.localId)
      sent += 1
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)

      return { sent, stoppedAt: msg }
    }
  }

  return { sent }
}

/** Escapa comillas simples para literales SQL entre comillas. */
function sqlQuoteString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`
}

/**
 * Genera sentencias INSERT (SQLite-compatible) como respaldo legible de la cola.
 * No ejecuta nada: es un volcado para auditoría / copia manual.
 */
export async function exportConductivityOutboxAsSql(): Promise<string> {
  const rows = await listConductivityOutboxFifo()

  if (rows.length === 0) {
    return '-- Cola de conductividad vacía\n'
  }

  const header = `-- ccasa conductividad pendiente (exportado ${new Date().toISOString()})\n` +
    `CREATE TABLE IF NOT EXISTS conductivity_outbox_pending (\n` +
    `  local_id TEXT PRIMARY KEY,\n` +
    `  created_at INTEGER NOT NULL,\n` +
    `  payload_json TEXT NOT NULL\n` +
    `);\n\n`

  const inserts = rows.map(r => {
    const json = JSON.stringify(r.payload)

    return (
      `INSERT INTO conductivity_outbox_pending (local_id, created_at, payload_json) VALUES (` +
      `${sqlQuoteString(r.localId)}, ${r.createdAt}, ${sqlQuoteString(json)});`
    )
  })

  return header + inserts.join('\n') + '\n'
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
