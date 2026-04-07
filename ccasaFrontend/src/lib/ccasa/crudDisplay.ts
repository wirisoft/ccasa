import { apiFetch } from '@/lib/ccasa/api'
import type { CrudFieldDef } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO, FkLookupMap } from '@/lib/ccasa/types'

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
  initialAmountG: 'Cantidad inicial (g)',
  currentAmountG: 'Cantidad actual (g)',
  openedAt: 'Fecha apertura',
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

/** Etiquetas en español para valores de estado/enums que el backend envía en inglés. */
const STATUS_LABELS: Record<string, string> = {
  Draft: 'Borrador',
  Signed: 'Firmada',
  Locked: 'Bloqueada',
  Open: 'Abierto',
  Closed: 'Cerrado',
  Pending: 'Pendiente',
  Resolved: 'Resuelta',
  Analyst: 'Analista',
  Supervisor: 'Supervisor',
  High: 'Alta',
  Low: 'Baja',
  Carboy: 'Garrafón',
  Flask: 'Matraz',
  Distilled: 'Destilada',
  Type: 'Tipo',
  Admin: 'Administrador',
  Sampler: 'Muestreador'
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
    if (STATUS_LABELS[value]) {
      return STATUS_LABELS[value]
    }
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    if (typeof value === 'string' && STATUS_LABELS[value]) {
      return STATUS_LABELS[value]
    }
    return String(value)
  }
}

function labelFromCrudItem(
  item: Record<string, unknown> & { id?: number; values?: Record<string, unknown> },
  labelKey: string | string[]
): string {
  if (Array.isArray(labelKey)) {
    return labelKey
      .map(k => item.values?.[k] ?? item[k] ?? '')
      .join(' ')
      .trim()
  }

  return String(item.values?.[labelKey] ?? item[labelKey] ?? '')
}

/**
 * Dado un array de CrudFieldDef[], extrae los campos async-select
 * y hace GET a cada optionsApiPath para construir un lookup {id → label}.
 *
 * Maneja dos formatos de respuesta del backend:
 * - CrudResponseDTO[]: { id, values: { name, ... } }
 * - DTO directo (ej. LogbookDTO[]): { id, name, code, ... }
 */
export async function buildFkLookupMap(fields: CrudFieldDef[]): Promise<FkLookupMap> {
  const fkFields = fields.filter(f => f.type === 'async-select' && f.optionsApiPath)

  if (fkFields.length === 0) return {}

  const entries = await Promise.all(
    fkFields.map(async f => {
      try {
        const data = await apiFetch<any[]>(f.optionsApiPath!)
        const lookup: Record<number | string, string> = {}
        const labelKey = f.optionLabelKey ?? 'name'

        for (const item of data) {
          const id = item.id

          if (id == null) continue

          const raw = labelFromCrudItem(item, labelKey)
          const label = raw || `#${id}`

          lookup[id] = label
        }

        return [f.key, lookup] as [string, Record<number | string, string>]
      } catch (err) {
        console.warn(`[buildFkLookupMap] Error cargando ${f.optionsApiPath}:`, err)

        return [f.key, {}] as [string, Record<number | string, string>]
      }
    })
  )

  return Object.fromEntries(entries)
}

/**
 * Dado un valor de celda, la columna, y el mapa de lookups FK,
 * retorna el label legible si existe, o el valor formateado normal.
 */
export function resolveFkDisplay(value: unknown, column: string, fkLookups: FkLookupMap): string {
  const lookup = fkLookups[column]

  if (lookup && value != null) {
    const resolved = lookup[value as number | string]

    if (resolved) return resolved
  }

  return formatCrudCell(value)
}
