/** Alineado con LogbookDTO del backend */
export type LogbookDTO = {
  id: number
  code: number
  name: string
  description: string
  maxEntries: number
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

export type LoginResponseDTO = {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  email: string
  role: string
}
