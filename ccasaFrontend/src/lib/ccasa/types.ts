/** Alineado con AuthResponseDTO del backend (POST /api/v1/auth/login|register|init-admin) */
export type AuthResponseDTO = {
  token: string
  userId: number
  email: string
  role: string
  firstName: string
  lastName: string
}

/** Alineado con LogbookDTO del backend (code/maxEntries son Integer en Java → number en JSON) */
export type LogbookDTO = {
  id: number
  code: number
  name: string
  description: string
  maxEntries: number
}

/** Alineado con CrudResponseDTO del backend (listados CRUD genéricos) */
export type CrudResponseDTO = {
  id: number
  values: Record<string, unknown>
}

/** Alineado con EntrySummaryDTO del backend */
export type EntrySummaryDTO = {
  id: number
  folioId: number
  folioNumber: number
  logbookId: number
  logbookCode: number
  logbookName: string
  userId: number
  entryStatus: string
  recordedAt: string
}

/** Alineado con DistilledWaterRequestDTO del backend (POST /api/v1/entries/distilled-water) */
export type DistilledWaterRequestDTO = {
  folioId: number
  logbookId: number
  userId: number
  phReading1?: number | null
  phReading2?: number | null
  phReading3?: number | null
  ceReading1?: number | null
  ceReading2?: number | null
  ceReading3?: number | null
  referenceDifference?: number | null
  controlStandardPct?: number | null
  waterBatchId?: number | null
}

/** Alineado con DistilledWaterResponseDTO del backend (GET /api/v1/entries/{entryId}/distilled-water) */
export type DistilledWaterResponseDTO = {
  entryId: number
  distilledWaterEntryId: number
  phReading1: number | null
  phReading2: number | null
  phReading3: number | null
  phAverage: number | null
  ceReading1: number | null
  ceReading2: number | null
  ceReading3: number | null
  ceAverage: number | null
  referenceDifference: number | null
  controlStandardPct: number | null
  isAcceptable: boolean | null
  waterBatchId: number | null
  entryStatus: string
}

/** Mapa de lookups para resolver FKs: { columnKey → { id → label } } */
export type FkLookupMap = Record<string, Record<number | string, string>>
