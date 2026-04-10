import * as React from 'react'
import type { ReactNode } from 'react'

import Chip from '@mui/material/Chip'

import { apiFetch } from '@/lib/ccasa/api'
import { formatDateDdMmYyyy } from '@/lib/ccasa/formatters'
import type { CrudFieldDef } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO, FkLookupMap } from '@/lib/ccasa/types'

export const ENTRY_STATUS_LABELS: Record<string, string> = {
  Draft: 'Borrador',
  Signed: 'Firmado',
  Locked: 'Bloqueado',
  Approved: 'Aprobado'
}

export const ROLE_LABELS: Record<string, string> = {
  Admin: 'Administrador',
  Analyst: 'Analista',
  Supervisor: 'Supervisor',
  Sampler: 'Muestreador'
}

export const CONDUCTIVITY_TYPE_LABELS: Record<string, string> = {
  High: 'Alta',
  Low: 'Baja'
}

const MAX_COLUMNS = 14

const HIDDEN_COLUMNS = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdByUserId',
  'updatedByUserId',
  'deletedByUserId',
  'passwordHash',
  'signatureStoragePath',
  'signatureContentType',
  'signatureFileName',
  'signatureUploadedAt',
  'entryId'
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
  waterBatchId: 'Lote de agua',
  referenceDifference: 'Diferencia referencia',
  controlStandardPct: 'Control estándar %',
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
  phReading1: 'pH Lectura 1',
  phReading2: 'pH Lectura 2',
  phReading3: 'pH Lectura 3',
  phAverage: 'pH Promedio',
  ceReading1: 'CE Lectura 1',
  ceReading2: 'CE Lectura 2',
  ceReading3: 'CE Lectura 3',
  ceAverage: 'CE Promedio',
  equipmentType: 'Tipo de equipo',
  denomination: 'Denominación',
  minValue: 'Valor mínimo',
  maxValue: 'Valor máximo',
  ruleDetail: 'Detalle de regla',
  nomenclature: 'Nomenclatura',
  signatureFileName: 'Archivo de firma',
  signatureContentType: 'Tipo de archivo',
  signatureStoragePath: 'Ruta de firma',
  signatureUploadedAt: 'Firma subida el'
}

/** Búsqueda O(1) por clave en minúsculas (p. ej. backend o proxy con distinto casing). */
const COLUMN_LABEL_BY_LOWER = new Map<string, string>(
  Object.entries(COLUMN_LABELS).map(([k, v]) => [k.toLowerCase(), v])
)

/**
 * Convierte claves estilo snake_case o SCREAMING_SNAKE a camelCase para alinearlas con COLUMN_LABELS.
 * Si no hay guiones bajos, devuelve la cadena original.
 */
function snakeOrScreamingSnakeToCamelCase(key: string): string {
  if (!key.includes('_')) {
    return key
  }

  const parts = key
    .toLowerCase()
    .split('_')
    .filter(p => p.length > 0)

  if (parts.length <= 1) {
    return key
  }

  return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')
}

/** Último recurso: texto legible a partir de camelCase o snake_case. */
function humanizeUnknownColumnKey(key: string): string {
  const withSpaces = key.includes('_')
    ? key.replace(/_/g, ' ')
    : key.replace(/([A-Z])/g, ' $1').trim()

  if (withSpaces === '') {
    return key
  }

  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
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
  const raw = key.trim()

  if (raw === '') {
    return ''
  }

  const fromMap = COLUMN_LABELS[raw]

  if (fromMap !== undefined) {
    return fromMap
  }

  const camel = snakeOrScreamingSnakeToCamelCase(raw)
  const fromCamel = COLUMN_LABELS[camel]

  if (fromCamel !== undefined) {
    return fromCamel
  }

  const byLower = COLUMN_LABEL_BY_LOWER.get(raw.toLowerCase())

  if (byLower !== undefined) {
    return byLower
  }

  if (camel !== raw) {
    const byCamelLower = COLUMN_LABEL_BY_LOWER.get(camel.toLowerCase())

    if (byCamelLower !== undefined) {
      return byCamelLower
    }
  }

  return humanizeUnknownColumnKey(raw)
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

/** Texto plano para búsqueda y accesibilidad (misma lógica que la celda, sin Chips). */
export function formatCrudCellPlain(value: unknown, column?: string): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  if (typeof value === 'string') {
    if (column === 'status' || column === 'entryStatus') {
      return ENTRY_STATUS_LABELS[value] ?? value
    }

    if (column === 'role' || column === 'roleId') {
      return ROLE_LABELS[value] ?? value
    }

    if (column === 'type' && CONDUCTIVITY_TYPE_LABELS[value]) {
      return CONDUCTIVITY_TYPE_LABELS[value] ?? value
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return formatDateDdMmYyyy(value)
    }

    if (STATUS_LABELS[value]) {
      return STATUS_LABELS[value]
    }

    return value
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? '—' : String(value)
  }

  if (typeof value === 'object') {
    return '—'
  }

  return String(value)
}

export function formatCrudCell(value: unknown, column?: string): ReactNode {
  if (typeof value === 'boolean') {
    return value
      ? React.createElement(Chip, { label: 'Sí', color: 'success', size: 'small' })
      : React.createElement(Chip, { label: 'No', color: 'error', size: 'small' })
  }

  return formatCrudCellPlain(value, column)
}

/** Fila devuelta por GET de opciones FK: CrudResponseDTO o DTO plano (p. ej. logbooks). */
type FkOptionsApiRow = Record<string, unknown> & { id?: number; values?: Record<string, unknown> }

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
        const data = await apiFetch<FkOptionsApiRow[]>(f.optionsApiPath!)
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
      } catch {
        // Fallo al cargar opciones FK: lookup vacío para esta columna (sin log en cliente).
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
export function resolveFkDisplayPlain(value: unknown, column: string, fkLookups: FkLookupMap): string {
  const lookup = fkLookups[column]

  if (lookup && value != null) {
    const resolved = lookup[value as number | string]

    if (resolved) return resolved
  }

  return formatCrudCellPlain(value, column)
}

export function resolveFkDisplay(value: unknown, column: string, fkLookups: FkLookupMap): ReactNode {
  const lookup = fkLookups[column]

  if (lookup && value != null) {
    const resolved = lookup[value as number | string]

    if (resolved) return resolved
  }

  return formatCrudCell(value, column)
}
