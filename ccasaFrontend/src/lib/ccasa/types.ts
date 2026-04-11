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

  /** Nombre de la bitácora (entry.logbook). */
  logbookName: string

  /** Nombre completo del usuario de la entrada (firstName + lastName o email). */
  analystName: string

  /** Folio mostrable (número de folio o REG-{id}). */
  folio: string

  /** Fecha de registro (UTC) formato dd/MM/yyyy alineado con el PDF. */
  recordedAt: string
}

/** Mapa de lookups para resolver FKs: { columnKey → { id → label } } */
export type FkLookupMap = Record<string, Record<number | string, string>>

export type ConductivityType = 'High' | 'Low'

export type ConductivityRecordStatus = 'Draft' | 'Signed' | 'Locked'

/** Alineado con la respuesta de listado de registros de conductividad (backend). */
export interface ConductivityRecord {
  conductivityId: number
  entryId: number | null
  displayFolio: string | null
  type: ConductivityType
  weightGrams: number
  referenceUScm: number | null
  referenceMol: number | null
  calculatedMol: number | null
  referenceStandardUScm: number | null
  calculatedValue: number | null
  inRange: boolean | null
  recordedAt: string | null
  preparationTime: string | null
  observation: string | null
  status: ConductivityRecordStatus | null
  createdByUserId: number | null
  createdByName: string | null
  createdByNomenclature: string | null
  reviewerUserId: number | null
  reviewerName: string | null
  reviewerNomenclature: string | null
  reviewedAt: string | null
}

/** Cuerpo para POST de creación de registro de conductividad. */
export interface CreateConductivityRequest {
  type: ConductivityType
  weightGrams: number
  logbookId?: number | null
  recordedAt?: string | null
  preparationTime?: string | null
  observation?: string | null
}
