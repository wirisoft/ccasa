import type { CrudResponseDTO } from '@/lib/ccasa/types'

const MAX_COLUMNS = 14

const HIDDEN_COLUMNS = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdByUserId',
  'updatedByUserId',
  'deletedByUserId',
  'passwordHash'
])

const COLUMN_LABELS: Record<string, string> = {
  id: 'ID',
  name: 'Nombre',
  description: 'Descripción',
  code: 'Código',
  email: 'Correo',
  firstName: 'Nombre',
  lastName: 'Apellido',
  active: 'Activo',
  roleId: 'Rol',
  identifier: 'Identificador',
  folioNumber: 'Nº Folio',
  status: 'Estado',
  maxEntries: 'Máx. entradas',
  type: 'Tipo',
  message: 'Mensaje',
  signatureType: 'Tipo de firma',
  batchCode: 'Código de lote',
  chemicalFormula: 'Fórmula',
  unit: 'Unidad',
  totalStock: 'Stock',
  concentration: 'Concentración',
  quantity: 'Cantidad',
  availableQty: 'Cant. disponible',
  startNumber: 'Nº inicio',
  endNumber: 'Nº fin',
  coverGenerated: 'Portada',
  folioBlockId: 'Bloque',
  logbookId: 'Bitácora',
  entryId: 'Entrada',
  userId: 'Usuario',
  folioId: 'Folio',
  reagentId: 'Reactivo',
  targetUserId: 'Destinatario',
  supervisorUserId: 'Supervisor',
  analystUserId: 'Analista',
  samplerUserId: 'Muestreador',
  solutionId: 'Solución',
  batchId: 'Lote',
  passwordHash: 'Contraseña',
  recordedAt: 'Fecha registro',
  generatedAt: 'Fecha generación',
  signedAt: 'Fecha firma',
  startDate: 'Fecha inicio',
  endDate: 'Fecha fin',
  measuredValue: 'Valor medido',
  calculatedValue: 'Valor calculado',
  calculatedMol: 'Mol calculado',
  weightGrams: 'Peso (g)',
  inRange: '¿En rango?',
  isAcceptable: '¿Aceptable?',
  rawTemperature: 'Temp. cruda',
  correctedTemperature: 'Temp. corregida',
  phReading1: 'pH L1',
  phReading2: 'pH L2',
  phReading3: 'pH L3',
  phAverage: 'pH Prom.',
  ceReading1: 'CE L1',
  ceReading2: 'CE L2',
  ceReading3: 'CE L3',
  ceAverage: 'CE Prom.'
}

export function getColumnLabel(key: string): string {
  return COLUMN_LABELS[key] ?? key
}

export function collectCrudColumns(rows: CrudResponseDTO[]): string[] {
  const keys = new Set<string>()

  for (const row of rows) {
    if (row.values && typeof row.values === 'object') {
      Object.keys(row.values).forEach(k => keys.add(k))
    }
  }

  const filtered = Array.from(keys)
    .filter(k => !HIDDEN_COLUMNS.has(k))
    .sort()
    .slice(0, MAX_COLUMNS)

  return ['id', ...filtered]
}

export function formatCrudCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
