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

/**
 * Texto contextual breve por ruta de API (p. ej. debajo del CardHeader en listados CRUD).
 */
export function getSectionInfo(apiPath: string): string | null {
  if (apiPath.includes('logbooks')) {
    return 'Las bitácoras son los libros de registro del laboratorio. El sistema crea automáticamente 15 bitácoras (códigos 1–15). Cada entrada de laboratorio pertenece a una bitácora.'
  }

  if (apiPath.includes('folio-blocks')) {
    return 'Los bloques de folios definen rangos numéricos para organizar los folios. Debes crear un bloque antes de crear folios manualmente. Los registros de conductividad crean su bloque automáticamente.'
  }

  if (apiPath.includes('folios')) {
    return 'Los folios son unidades de registro dentro de una bitácora. Requieren un bloque de folios y una bitácora. Los registros de conductividad generan su folio automáticamente con formato BSA-COND-XXXXXX.'
  }

  if (apiPath.includes('reagents')) {
    return 'Catálogo de reactivos del laboratorio. Debes registrar los reactivos antes de crear lotes o frascos de reactivo. Son necesarios también en los módulos de Horno de secado, Gastos y cartas, y Pesadas.'
  }

  if (apiPath.includes('batches')) {
    return 'Los lotes identifican partidas específicas de reactivos. Requieren tener al menos un reactivo registrado. Son opcionales en Agua destilada y requeridos en Gastos y cartas.'
  }

  if (apiPath.includes('solutions')) {
    return 'Catálogo de soluciones del laboratorio. El sistema incluye 16 soluciones predeterminadas. Son necesarias en los módulos de Pesadas y Preparación de soluciones.'
  }

  if (apiPath.includes('supplies')) {
    return 'Insumos generales del laboratorio. Son necesarios en el módulo de Tratamiento de matraz (hisopos). Registra aquí cualquier material de consumo del laboratorio.'
  }

  if (apiPath.includes('equipment')) {
    return 'Equipos de laboratorio disponibles. El sistema incluye 8 equipos predeterminados. Se usan como referencia en Gastos y cartas. Registra tipo y denominación de cada equipo.'
  }

  if (apiPath.includes('reagent-jars')) {
    return 'Registro de frascos físicos de reactivos. Requieren tener un reactivo registrado. Llevan control de cantidad inicial y actual. Son necesarios en el módulo de Gastos y cartas.'
  }

  if (apiPath.includes('reference-parameters')) {
    return 'Parámetros de referencia usados en los cálculos de conductividad KCl. El sistema los carga automáticamente al arrancar. Solo el administrador puede modificarlos. Cambiarlos afecta directamente los cálculos.'
  }

  if (apiPath.includes('roles')) {
    return 'Roles disponibles en el sistema. Cada usuario debe tener un rol asignado. Los roles Admin, Analyst, Supervisor y Sampler ya existen por defecto.'
  }

  if (apiPath.includes('alerts')) {
    return 'Alertas del sistema. Registra y gestiona alertas generadas durante la operación del laboratorio. Pueden asignarse a un usuario específico.'
  }

  if (apiPath.includes('signatures')) {
    return 'Firmas digitales del sistema. Se generan automáticamente al firmar o aprobar una entrada desde el módulo de Entradas → Núcleo. Este módulo es solo de consulta.'
  }

  if (apiPath.includes('users')) {
    return 'Empleados del laboratorio. Solo el administrador puede crear o modificar usuarios. Para poder aprobar registros de conductividad, el usuario debe tener asignada la nomenclatura TCM o TMC.'
  }

  if (apiPath.includes('entry-conductivity')) {
    return 'Registros de conductividad KCl (RF-05). El sistema calcula automáticamente la conductividad teórica y verifica si está en el rango de aceptación (~1400–1420 µS/cm para Alta). Requiere una bitácora activa. Para aprobar un registro, debe existir un usuario con nomenclatura TCM o TMC.'
  }

  if (apiPath.includes('entry-distilled-water')) {
    return 'Registros de agua destilada (RF-08). Requiere crear primero una Entrada en el módulo Entradas → Núcleo. El sistema calcula promedios de pH y CE automáticamente.'
  }

  if (apiPath.includes('entry-oven-temp')) {
    return 'Registros de temperatura de horno. Requiere una entrada núcleo existente creada en Entradas → Núcleo.'
  }

  if (apiPath.includes('entry-drying-oven')) {
    return 'Registros del horno de secado. Requiere una entrada núcleo y un reactivo registrado. Puedes asignar analista y supervisor.'
  }

  if (apiPath.includes('entry-expense-chart')) {
    return 'Registro de gastos y cartas del laboratorio. Requiere una entrada núcleo, un lote de reactivo y un frasco de KCl registrados previamente.'
  }

  if (apiPath.includes('entry-material-wash')) {
    return 'Registros de lavado de material (RF-09). Requiere una entrada núcleo. Es necesario completarlo antes de crear un Tratamiento de matraz.'
  }

  if (apiPath.includes('entry-solution-prep')) {
    return 'Registro de preparación de soluciones. Requiere una entrada núcleo, una solución del catálogo y una pesada registrada previamente en el módulo de Pesadas.'
  }

  if (apiPath.includes('entry-weighing')) {
    return 'Registro de pesadas del laboratorio. Requiere una entrada núcleo y un reactivo. La solución destino es opcional. Es necesario completarlo antes de crear una Preparación de soluciones.'
  }

  if (apiPath.includes('entry-accuracy')) {
    return 'Registros de mediciones de precisión. Requiere una entrada núcleo, un muestreador y seleccionar la bitácora de pH correspondiente.'
  }

  if (apiPath.includes('entry-flask-treatment')) {
    return 'Registro de tratamiento de matraz. Requiere una entrada núcleo, un registro de Lavado de material previo y un insumo de hisopos registrado en el catálogo de Insumos.'
  }

  if (apiPath.includes('entries')) {
    return 'Entradas núcleo del laboratorio. Cada tipo de registro (temperatura, lavado, pesadas, etc.) necesita una entrada base creada aquí. Los registros de conductividad y agua destilada crean su entrada automáticamente.'
  }

  return null
}
