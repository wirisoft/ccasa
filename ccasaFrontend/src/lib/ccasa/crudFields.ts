/**
 * Tipos y configuraciones para formularios CRUD dinámicos alineados con el backend.
 */

/** Cuerpo que el backend espera en POST/PUT de entidades CRUD genéricas. */
export type CrudRequestDTO = {
  values: Record<string, unknown>
}

export type CrudFieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'date'
  | 'boolean'
  | 'async-select'

export type CrudSelectOption = {
  value: string | number
  label: string
}

export type CrudFieldDef = {
  key: string
  label: string
  type: CrudFieldType
  required?: boolean
  placeholder?: string
  defaultValue?: unknown
  options?: CrudSelectOption[]

  /** Para async-select: path de la API para cargar opciones (ej. '/api/v1/users') */
  optionsApiPath?: string

  /** Para async-select: qué campo del response usar como valor del option (default: 'id') */
  optionValueKey?: string

  /**
   * Para async-select: qué campo(s) de values usar como label legible.
   * Puede ser un string (ej. 'name') o un array (ej. ['firstName', 'lastName'] para concatenar).
   * Default: 'name'
   */
  optionLabelKey?: string | string[]

  /** Columnas en grid 12 (1–12). Por defecto 12. */
  gridCols?: number
  helperText?: string

  /** Si true, el campo no se edita en actualización (solo creación). */
  readOnlyOnEdit?: boolean

  /** Si true, el campo no se muestra en el diálogo de edición (sí en creación). */
  hideOnEdit?: boolean

  /**
   * Si true y type es `date`, el payload usa ISO-8601 instant (ej. `2026-04-07T00:00:00Z`) para `Instant.parse` en el backend.
   * Si false u omitido, se envía `YYYY-MM-DD` para campos mapeados a `LocalDate`.
   */
  dateAsIsoInstant?: boolean
}

export type CrudResourceConfig = {
  key: string
  label: string
  labelPlural: string
  apiPath: string
  fields: CrudFieldDef[]
}

/** Campos de negocio de LogbookEntity (code, name, description, maxEntries). */
export const LOGBOOK_FIELDS: CrudFieldDef[] = [
  {
    key: 'code',
    label: 'Código',
    type: 'number',
    required: true,
    gridCols: 4,
    helperText: 'Entero único que identifica la bitácora (1–15 en datos semilla).'
  },
  {
    key: 'name',
    label: 'Nombre',
    type: 'text',
    required: true,
    gridCols: 8,
    placeholder: 'Máx. 150 caracteres'
  },
  {
    key: 'description',
    label: 'Descripción',
    type: 'textarea'
  },
  {
    key: 'maxEntries',
    label: 'Máximo de entradas',
    type: 'number',
    gridCols: 4
  }
]

export const LOGBOOK_CONFIG: CrudResourceConfig = {
  key: 'logbooks',
  label: 'Bitácora',
  labelPlural: 'Bitácoras',
  apiPath: '/api/v1/logbooks',
  fields: LOGBOOK_FIELDS
}

/** Reactivos — claves alineadas con CrudEntityMapper del backend. */
export const REAGENT_FIELDS: CrudFieldDef[] = [
  { key: 'name', label: 'Nombre', type: 'text', required: true, gridCols: 6 },
  { key: 'chemicalFormula', label: 'Fórmula química', type: 'text', gridCols: 6 },
  { key: 'unit', label: 'Unidad', type: 'text', gridCols: 6 },
  { key: 'totalStock', label: 'Stock total', type: 'number', gridCols: 6 }
]

export const REAGENT_CONFIG: CrudResourceConfig = {
  key: 'reagents',
  label: 'Reactivo',
  labelPlural: 'Reactivos',
  apiPath: '/api/v1/reagents',
  fields: REAGENT_FIELDS
}

/** Lotes — claves alineadas con CrudEntityMapper del backend. */
export const BATCH_FIELDS: CrudFieldDef[] = [
  { key: 'batchCode', label: 'Código de lote', type: 'text', required: true, gridCols: 6 },
  {
    key: 'reagentId',
    label: 'Reactivo',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/reagents',
    optionLabelKey: 'name'
  },
  { key: 'generatedAt', label: 'Fecha de generación', type: 'date', gridCols: 4 },
  { key: 'startDate', label: 'Fecha inicio', type: 'date', gridCols: 4 },
  { key: 'endDate', label: 'Fecha fin', type: 'date', gridCols: 4 }
]

export const BATCH_CONFIG: CrudResourceConfig = {
  key: 'batches',
  label: 'Lote',
  labelPlural: 'Lotes',
  apiPath: '/api/v1/batches',
  fields: BATCH_FIELDS
}

/** Soluciones — claves alineadas con CrudEntityMapper del backend. */
export const SOLUTION_FIELDS: CrudFieldDef[] = [
  { key: 'name', label: 'Nombre', type: 'text', required: true, gridCols: 6 },
  { key: 'concentration', label: 'Concentración', type: 'text', gridCols: 6 },
  { key: 'quantity', label: 'Cantidad', type: 'text', gridCols: 6 }
]

export const SOLUTION_CONFIG: CrudResourceConfig = {
  key: 'solutions',
  label: 'Solución',
  labelPlural: 'Soluciones',
  apiPath: '/api/v1/solutions',
  fields: SOLUTION_FIELDS
}

/** Insumos — claves alineadas con CrudEntityMapper del backend. */
export const SUPPLY_FIELDS: CrudFieldDef[] = [
  { key: 'name', label: 'Nombre', type: 'text', required: true, gridCols: 6 },
  { key: 'availableQty', label: 'Cantidad disponible', type: 'number', gridCols: 6 },
  { key: 'unit', label: 'Unidad', type: 'text', gridCols: 6 }
]

export const SUPPLY_CONFIG: CrudResourceConfig = {
  key: 'supplies',
  label: 'Insumo',
  labelPlural: 'Insumos',
  apiPath: '/api/v1/supplies',
  fields: SUPPLY_FIELDS
}

// ---------------------------------------------------------------------------
// Equipos de laboratorio
// ---------------------------------------------------------------------------
export const EQUIPMENT_FIELDS: CrudFieldDef[] = [
  { key: 'equipmentType', label: 'Tipo de equipo', type: 'text', required: true, gridCols: 6 },
  { key: 'denomination', label: 'Denominación', type: 'text', required: true, gridCols: 6 }
]

export const EQUIPMENT_CONFIG: CrudResourceConfig = {
  key: 'equipment',
  label: 'Equipo',
  labelPlural: 'Equipos de laboratorio',
  apiPath: '/api/v1/equipment',
  fields: EQUIPMENT_FIELDS
}

// ---------------------------------------------------------------------------
// Parámetros de referencia
// ---------------------------------------------------------------------------
export const REFERENCE_PARAMETER_FIELDS: CrudFieldDef[] = [
  { key: 'code', label: 'Código', type: 'text', required: true, gridCols: 4 },
  { key: 'minValue', label: 'Valor mínimo', type: 'number', gridCols: 4 },
  { key: 'maxValue', label: 'Valor máximo', type: 'number', gridCols: 4 },
  { key: 'description', label: 'Descripción', type: 'text', gridCols: 6 },
  { key: 'ruleDetail', label: 'Detalle de regla', type: 'text', gridCols: 6 }
]

export const REFERENCE_PARAMETER_CONFIG: CrudResourceConfig = {
  key: 'reference-parameters',
  label: 'Parámetro de referencia',
  labelPlural: 'Parámetros de referencia',
  apiPath: '/api/v1/reference-parameters',
  fields: REFERENCE_PARAMETER_FIELDS
}

/** Roles — claves alineadas con CrudEntityMapper del backend. */
export const ROLE_FIELDS: CrudFieldDef[] = [
  {
    key: 'name',
    label: 'Nombre del rol',
    type: 'text',
    required: true,
    gridCols: 6
  },
  { key: 'description', label: 'Descripción', type: 'textarea' }
]

export const ROLE_CONFIG: CrudResourceConfig = {
  key: 'roles',
  label: 'Rol',
  labelPlural: 'Roles',
  apiPath: '/api/v1/roles',
  fields: ROLE_FIELDS
}

export const FOLIO_BLOCK_FIELDS: CrudFieldDef[] = [
  {
    key: 'identifier',
    label: 'Identificador',
    type: 'text',
    required: true,
    gridCols: 6,
    placeholder: 'Ej. 1-MT',
    helperText: 'Código del bloque (ej. 1-MT, 2-MT)'
  },
  {
    key: 'startNumber',
    label: 'Número inicio',
    type: 'number',
    required: true,
    gridCols: 3,
    placeholder: 'Ej. 1',
    helperText: 'Debe ser un número mayor a 0'
  },
  {
    key: 'endNumber',
    label: 'Número fin',
    type: 'number',
    required: true,
    gridCols: 3,
    placeholder: 'Ej. 200',
    helperText: 'Debe ser un número mayor a 0'
  },
  { key: 'coverGenerated', label: 'Portada generada', type: 'boolean' }
]

export const FOLIO_BLOCK_CONFIG: CrudResourceConfig = {
  key: 'folio-blocks',
  label: 'Bloque de folios',
  labelPlural: 'Bloques de folios',
  apiPath: '/api/v1/folio-blocks',
  fields: FOLIO_BLOCK_FIELDS
}

export const FOLIO_FIELDS: CrudFieldDef[] = [
  { key: 'folioNumber', label: 'Número de folio', type: 'number', required: true, gridCols: 4 },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    required: true,
    gridCols: 4,
    options: [
      { value: 'Open', label: 'Abierto' },
      { value: 'Closed', label: 'Cerrado' }
    ],
    defaultValue: 'Open'
  },
  {
    key: 'folioBlockId',
    label: 'Bloque de folios',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/folio-blocks',
    optionLabelKey: 'identifier'
  },
  {
    key: 'logbookId',
    label: 'Bitácora',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/logbooks',
    optionValueKey: 'id',
    optionLabelKey: 'name'
  }
]

export const FOLIO_CONFIG: CrudResourceConfig = {
  key: 'folios',
  label: 'Folio',
  labelPlural: 'Folios',
  apiPath: '/api/v1/folios',
  fields: FOLIO_FIELDS
}

/** Alertas — claves alineadas con CrudEntityMapper del backend. */
export const ALERT_FIELDS: CrudFieldDef[] = [
  {
    key: 'type',
    label: 'Tipo',
    type: 'text',
    required: true,
    gridCols: 6,
    placeholder: 'Ej. Critical Oven'
  },
  {
    key: 'message',
    label: 'Mensaje',
    type: 'textarea',
    required: true,
    placeholder: 'Descripción de la alerta…'
  },
  {
    key: 'generatedAt',
    label: 'Fecha de generación',
    type: 'date',
    gridCols: 6,
    dateAsIsoInstant: true
  },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    required: true,
    gridCols: 6,
    options: [
      { value: 'Pending', label: 'Pendiente' },
      { value: 'Resolved', label: 'Resuelta' }
    ],
    defaultValue: 'Pending'
  },
  {
    key: 'targetUserId',
    label: 'Usuario destino',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  }
]

export const ALERT_CONFIG: CrudResourceConfig = {
  key: 'alerts',
  label: 'Alerta',
  labelPlural: 'Alertas',
  apiPath: '/api/v1/alerts',
  fields: ALERT_FIELDS
}

/** Firmas — claves alineadas con CrudEntityMapper del backend. */
export const SIGNATURE_FIELDS: CrudFieldDef[] = [
  {
    key: 'signatureType',
    label: 'Tipo de firma',
    type: 'select',
    required: true,
    gridCols: 6,
    options: [
      { value: 'Analyst', label: 'Analista' },
      { value: 'Supervisor', label: 'Supervisor' }
    ]
  },
  {
    key: 'signedAt',
    label: 'Fecha de firma',
    type: 'date',
    gridCols: 6,
    dateAsIsoInstant: true
  },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'supervisorUserId',
    label: 'Supervisor',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  }
]

export const SIGNATURE_CONFIG: CrudResourceConfig = {
  key: 'signatures',
  label: 'Firma',
  labelPlural: 'Firmas',
  apiPath: '/api/v1/signatures',
  fields: SIGNATURE_FIELDS
}

/** Usuarios (empleados) — claves alineadas con CrudEntityMapper del backend (UserEntity). */
export const USER_FIELDS: CrudFieldDef[] = [
  { key: 'firstName', label: 'Nombre', type: 'text', required: true, gridCols: 6 },
  { key: 'lastName', label: 'Apellido', type: 'text', required: true, gridCols: 6 },
  {
    key: 'email',
    label: 'Correo electrónico',
    type: 'text',
    required: true,
    gridCols: 6,
    placeholder: 'correo@ejemplo.com',
    helperText: 'Ingresa un correo electrónico válido'
  },
  {
    key: 'roleId',
    label: 'Rol',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/roles',
    optionLabelKey: 'name'
  },
  {
    key: 'nomenclature',
    label: 'Nomenclatura',
    type: 'text',
    gridCols: 6,
    helperText: 'Ej: TCM, TMC. Requerido para revisar registros de conductividad.'
  },
  {
    key: 'passwordHash',
    label: 'Contraseña',
    type: 'text',
    gridCols: 6,
    helperText: 'Solo necesaria al crear un usuario nuevo.',
    hideOnEdit: true
  },
  { key: 'active', label: 'Activo', type: 'boolean', defaultValue: true }
]

export const USER_CONFIG: CrudResourceConfig = {
  key: 'users',
  label: 'Empleado',
  labelPlural: 'Empleados',
  apiPath: '/api/v1/users',
  fields: USER_FIELDS
}

/** Entrada genérica (Entry) — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_CORE_FIELDS: CrudFieldDef[] = [
  { key: 'recordedAt', label: 'Fecha de registro', type: 'date', gridCols: 6, dateAsIsoInstant: true },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    gridCols: 6,
    options: [
      { value: 'Draft', label: 'Borrador' },
      { value: 'Signed', label: 'Firmada' },
      { value: 'Locked', label: 'Bloqueada' }
    ],
    defaultValue: 'Draft'
  },
  {
    key: 'folioId',
    label: 'Folio',
    type: 'async-select',
    required: false,
    gridCols: 4,
    optionsApiPath: '/api/v1/folios',
    optionLabelKey: 'folioNumber'
  },
  {
    key: 'logbookId',
    label: 'Bitácora',
    type: 'async-select',
    required: true,
    gridCols: 4,
    optionsApiPath: '/api/v1/logbooks',
    optionLabelKey: 'name'
  },
  {
    key: 'userId',
    label: 'Usuario',
    type: 'async-select',
    required: false,
    gridCols: 4,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  }
]

export const ENTRY_CORE_CONFIG: CrudResourceConfig = {
  key: 'entries',
  label: 'Entrada',
  labelPlural: 'Entradas',
  apiPath: '/api/v1/entries',
  fields: ENTRY_CORE_FIELDS
}

/** Agua destilada — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_DISTILLED_WATER_FIELDS: CrudFieldDef[] = [
  { key: 'phReading1', label: 'pH Lectura 1', type: 'number', gridCols: 4 },
  { key: 'phReading2', label: 'pH Lectura 2', type: 'number', gridCols: 4 },
  { key: 'phReading3', label: 'pH Lectura 3', type: 'number', gridCols: 4 },
  { key: 'phAverage', label: 'pH Promedio', type: 'number', gridCols: 4 },
  { key: 'ceReading1', label: 'CE Lectura 1', type: 'number', gridCols: 4 },
  { key: 'ceReading2', label: 'CE Lectura 2', type: 'number', gridCols: 4 },
  { key: 'ceReading3', label: 'CE Lectura 3', type: 'number', gridCols: 4 },
  { key: 'ceAverage', label: 'CE Promedio', type: 'number', gridCols: 4 },
  { key: 'referenceDifference', label: 'Diferencia referencia', type: 'number', gridCols: 4 },
  { key: 'controlStandardPct', label: 'Estándar control %', type: 'number', gridCols: 4 },
  { key: 'isAcceptable', label: '¿Aceptable?', type: 'boolean' },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'waterBatchId',
    label: 'Lote de agua',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/batches',
    optionLabelKey: 'batchCode'
  }
]

export const ENTRY_DISTILLED_WATER_CONFIG: CrudResourceConfig = {
  key: 'entry-distilled-water',
  label: 'Agua destilada',
  labelPlural: 'Registros de agua destilada',
  apiPath: '/api/v1/entry-distilled-water',
  fields: ENTRY_DISTILLED_WATER_FIELDS
}

/** Conductividad — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_CONDUCTIVITY_FIELDS: CrudFieldDef[] = [
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    required: true,
    gridCols: 6,
    options: [
      { value: 'High', label: 'Alta' },
      { value: 'Low', label: 'Baja' }
    ]
  },
  { key: 'measuredValue', label: 'Valor medido', type: 'number', gridCols: 6 },
  { key: 'weightGrams', label: 'Peso (g)', type: 'number', required: true, gridCols: 6 },
  { key: 'calculatedMol', label: 'Mol calculado', type: 'number', gridCols: 6 },
  { key: 'calculatedValue', label: 'Valor calculado', type: 'number', gridCols: 6 },
  { key: 'inRange', label: '¿En rango?', type: 'boolean' },
  { key: 'autoDate', label: 'Fecha automática', type: 'date', gridCols: 6, dateAsIsoInstant: true },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  }
]

export const ENTRY_CONDUCTIVITY_CONFIG: CrudResourceConfig = {
  key: 'entry-conductivity',
  label: 'Conductividad',
  labelPlural: 'Registros de conductividad',
  apiPath: '/api/v1/entry-conductivity',
  fields: ENTRY_CONDUCTIVITY_FIELDS
}

/** Temperatura horno — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_OVEN_TEMP_FIELDS: CrudFieldDef[] = [
  { key: 'rawTemperature', label: 'Temperatura cruda', type: 'number', gridCols: 6 },
  { key: 'correctedTemperature', label: 'Temperatura corregida', type: 'number', gridCols: 6 },
  { key: 'readingNumber', label: 'Número de lectura', type: 'number', gridCols: 4 },
  { key: 'recordedAt', label: 'Fecha de registro', type: 'date', gridCols: 4, dateAsIsoInstant: true },
  { key: 'inRange', label: '¿En rango?', type: 'boolean' },
  { key: 'isMaintenance', label: '¿Mantenimiento?', type: 'boolean' },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  }
]

export const ENTRY_OVEN_TEMP_CONFIG: CrudResourceConfig = {
  key: 'entry-oven-temp',
  label: 'Temperatura horno',
  labelPlural: 'Registros de temperatura horno',
  apiPath: '/api/v1/entry-oven-temp',
  fields: ENTRY_OVEN_TEMP_FIELDS
}

/** Horno de secado — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_DRYING_OVEN_FIELDS: CrudFieldDef[] = [
  {
    key: 'entryTime',
    label: 'Hora entrada',
    type: 'text',
    gridCols: 6,
    placeholder: 'HH:mm',
    helperText: 'Formato hora (ej. 08:30)'
  },
  {
    key: 'exitTime',
    label: 'Hora salida',
    type: 'text',
    gridCols: 6,
    placeholder: 'HH:mm'
  },
  { key: 'meetsTemp', label: '¿Cumple temperatura?', type: 'boolean' },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 4,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'reagentId',
    label: 'Reactivo',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/reagents',
    optionLabelKey: 'name'
  },
  {
    key: 'analystUserId',
    label: 'Analista',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  },
  {
    key: 'supervisorUserId',
    label: 'Supervisor',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  }
]

export const ENTRY_DRYING_OVEN_CONFIG: CrudResourceConfig = {
  key: 'entry-drying-oven',
  label: 'Horno de secado',
  labelPlural: 'Registros de horno de secado',
  apiPath: '/api/v1/entry-drying-oven',
  fields: ENTRY_DRYING_OVEN_FIELDS
}

/** Gasto/carta — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_EXPENSE_CHART_FIELDS: CrudFieldDef[] = [
  { key: 'employmentDate', label: 'Fecha de empleo', type: 'date', gridCols: 6 },
  { key: 'endDate', label: 'Fecha fin', type: 'date', gridCols: 6 },
  { key: 'equipmentKey', label: 'Clave equipo', type: 'text', gridCols: 6 },
  { key: 'distilledWaterQty', label: 'Cantidad agua destilada', type: 'number', gridCols: 6 },
  {
    key: 'waterType',
    label: 'Tipo de agua',
    type: 'select',
    gridCols: 6,
    options: [
      { value: 'Distilled', label: 'Destilada' },
      { value: 'Type', label: 'Tipo' }
    ]
  },
  { key: 'kclUsedG', label: 'KCl usado (g)', type: 'number', gridCols: 6 },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 4,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'batchId',
    label: 'Lote',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/batches',
    optionLabelKey: 'batchCode'
  },
  {
    key: 'kclJarId',
    label: 'Frasco KCl',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/reagent-jars',
    optionLabelKey: 'id'
  }
]

export const ENTRY_EXPENSE_CHART_CONFIG: CrudResourceConfig = {
  key: 'entry-expense-chart',
  label: 'Gasto/carta',
  labelPlural: 'Gastos y cartas',
  apiPath: '/api/v1/entry-expense-chart',
  fields: ENTRY_EXPENSE_CHART_FIELDS
}

/** Lavado de material — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_MATERIAL_WASH_FIELDS: CrudFieldDef[] = [
  { key: 'mondayDate', label: 'Fecha lunes', type: 'date', gridCols: 6 },
  {
    key: 'pieceType',
    label: 'Tipo de pieza',
    type: 'select',
    gridCols: 6,
    options: [
      { value: 'Carboy', label: 'Garrafón' },
      { value: 'Flask', label: 'Matraz' }
    ]
  },
  { key: 'material', label: 'Material', type: 'text', gridCols: 6 },
  { key: 'determination', label: 'Determinación', type: 'text', gridCols: 6 },
  { key: 'color', label: 'Color', type: 'text', gridCols: 4 },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 4,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'analystUserId',
    label: 'Analista',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  },
  {
    key: 'supervisorUserId',
    label: 'Supervisor',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  }
]

export const ENTRY_MATERIAL_WASH_CONFIG: CrudResourceConfig = {
  key: 'entry-material-wash',
  label: 'Lavado de material',
  labelPlural: 'Registros de lavado',
  apiPath: '/api/v1/entry-material-wash',
  fields: ENTRY_MATERIAL_WASH_FIELDS
}

/** Preparación de solución — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_SOLUTION_PREP_FIELDS: CrudFieldDef[] = [
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'solutionId',
    label: 'Solución',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/solutions',
    optionLabelKey: 'name'
  },
  {
    key: 'weighingEntryId',
    label: 'Entrada de pesada',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/entry-weighing',
    optionLabelKey: 'id'
  },
  {
    key: 'analystUserId',
    label: 'Analista',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  }
]

export const ENTRY_SOLUTION_PREP_CONFIG: CrudResourceConfig = {
  key: 'entry-solution-prep',
  label: 'Preparación de solución',
  labelPlural: 'Preparaciones de solución',
  apiPath: '/api/v1/entry-solution-prep',
  fields: ENTRY_SOLUTION_PREP_FIELDS
}

/** Pesada — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_WEIGHING_FIELDS: CrudFieldDef[] = [
  { key: 'weightGrams', label: 'Peso (gramos)', type: 'number', gridCols: 6 },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 6,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'reagentId',
    label: 'Reactivo',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/reagents',
    optionLabelKey: 'name'
  },
  {
    key: 'targetSolutionId',
    label: 'Solución destino',
    type: 'async-select',
    gridCols: 6,
    optionsApiPath: '/api/v1/solutions',
    optionLabelKey: 'name'
  }
]

export const ENTRY_WEIGHING_CONFIG: CrudResourceConfig = {
  key: 'entry-weighing',
  label: 'Pesada',
  labelPlural: 'Pesadas',
  apiPath: '/api/v1/entry-weighing',
  fields: ENTRY_WEIGHING_FIELDS
}

/** Precisión — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_ACCURACY_FIELDS: CrudFieldDef[] = [
  { key: 'batch1Avg', label: 'Promedio lote 1', type: 'number', gridCols: 6 },
  { key: 'batch2Avg', label: 'Promedio lote 2', type: 'number', gridCols: 6 },
  { key: 'difference', label: 'Diferencia', type: 'number', gridCols: 4 },
  { key: 'inRange', label: '¿En rango?', type: 'boolean' },
  { key: 'phFolioNumber', label: 'Número folio pH', type: 'number', gridCols: 4 },
  { key: 'dailyRecordDate', label: 'Fecha registro diario', type: 'date', gridCols: 4 },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 4,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'samplerUserId',
    label: 'Muestreador',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  },
  {
    key: 'phLogbookId',
    label: 'Bitácora pH',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/logbooks',
    optionValueKey: 'id',
    optionLabelKey: 'name'
  }
]

export const ENTRY_ACCURACY_CONFIG: CrudResourceConfig = {
  key: 'entry-accuracy',
  label: 'Precisión',
  labelPlural: 'Registros de precisión',
  apiPath: '/api/v1/entry-accuracy',
  fields: ENTRY_ACCURACY_FIELDS
}

/** Tratamiento de matraz — claves alineadas con CrudEntityMapper del backend. */
export const ENTRY_FLASK_TREATMENT_FIELDS: CrudFieldDef[] = [
  { key: 'swabsUsed', label: 'Hisopos usados', type: 'number', gridCols: 6 },
  { key: 'analysisValue', label: 'Valor de análisis', type: 'number', gridCols: 6 },
  { key: 'cmcResult', label: 'Resultado CMC', type: 'text', gridCols: 6 },
  { key: 'reportDate', label: 'Fecha de reporte', type: 'date', gridCols: 6 },
  {
    key: 'entryId',
    label: 'Entrada',
    type: 'async-select',
    required: true,
    gridCols: 4,
    optionsApiPath: '/api/v1/entries',
    optionLabelKey: 'id'
  },
  {
    key: 'washEntryId',
    label: 'Entrada de lavado',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/entry-material-wash',
    optionLabelKey: 'id'
  },
  {
    key: 'swabSupplyId',
    label: 'Insumo hisopo',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/supplies',
    optionLabelKey: 'name'
  },
  {
    key: 'supervisorUserId',
    label: 'Supervisor',
    type: 'async-select',
    gridCols: 4,
    optionsApiPath: '/api/v1/users',
    optionLabelKey: ['firstName', 'lastName']
  }
]

export const ENTRY_FLASK_TREATMENT_CONFIG: CrudResourceConfig = {
  key: 'entry-flask-treatment',
  label: 'Tratamiento de matraz',
  labelPlural: 'Tratamientos de matraz',
  apiPath: '/api/v1/entry-flask-treatment',
  fields: ENTRY_FLASK_TREATMENT_FIELDS
}

// ---------------------------------------------------------------------------
// Frascos de reactivo
// ---------------------------------------------------------------------------
export const REAGENT_JAR_FIELDS: CrudFieldDef[] = [
  {
    key: 'reagentId',
    label: 'Reactivo',
    type: 'async-select',
    optionsApiPath: '/api/v1/reagents',
    optionLabelKey: 'name',
    required: true,
    gridCols: 6
  },
  {
    key: 'initialAmountG',
    label: 'Cantidad inicial (g)',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'Debe ser mayor a 0'
  },
  {
    key: 'currentAmountG',
    label: 'Cantidad actual (g)',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'Debe ser mayor a 0'
  },
  { key: 'openedAt', label: 'Fecha de apertura', type: 'date', required: false, gridCols: 6 }
]

export const REAGENT_JAR_CONFIG: CrudResourceConfig = {
  key: 'reagent-jars',
  label: 'Frasco de reactivo',
  labelPlural: 'Frascos de reactivo',
  apiPath: '/api/v1/reagent-jars',
  fields: REAGENT_JAR_FIELDS
}

/** Todas las configuraciones CRUD registradas para búsqueda por `key`. */
export const ALL_CONFIGS: CrudResourceConfig[] = [
  LOGBOOK_CONFIG,
  REAGENT_CONFIG,
  REAGENT_JAR_CONFIG,
  BATCH_CONFIG,
  SOLUTION_CONFIG,
  SUPPLY_CONFIG,
  EQUIPMENT_CONFIG,
  REFERENCE_PARAMETER_CONFIG,
  ROLE_CONFIG,
  FOLIO_BLOCK_CONFIG,
  FOLIO_CONFIG,
  ALERT_CONFIG,
  SIGNATURE_CONFIG,
  USER_CONFIG,
  ENTRY_CORE_CONFIG,
  ENTRY_DISTILLED_WATER_CONFIG,
  ENTRY_CONDUCTIVITY_CONFIG,
  ENTRY_OVEN_TEMP_CONFIG,
  ENTRY_DRYING_OVEN_CONFIG,
  ENTRY_EXPENSE_CHART_CONFIG,
  ENTRY_MATERIAL_WASH_CONFIG,
  ENTRY_SOLUTION_PREP_CONFIG,
  ENTRY_WEIGHING_CONFIG,
  ENTRY_ACCURACY_CONFIG,
  ENTRY_FLASK_TREATMENT_CONFIG
]

/** Alias de `ALL_CONFIGS` (misma referencia). */
export const CRUD_CONFIGS = ALL_CONFIGS

export function getCrudConfig(key: string): CrudResourceConfig | undefined {
  return ALL_CONFIGS.find(c => c.key === key)
}

/**
 * Mapeo slug UI → CrudResourceConfig de campos para entradas por tipo.
 * Los slugs coinciden con los de ENTRADA_BACKEND_BY_SLUG en backendApiRegistry.ts.
 */
export const ENTRY_CONFIG_BY_SLUG: Record<string, CrudResourceConfig> = {
  'agua-destilada': ENTRY_DISTILLED_WATER_CONFIG,
  'conductividad': ENTRY_CONDUCTIVITY_CONFIG,
  'temperatura-horno': ENTRY_OVEN_TEMP_CONFIG,
  'horno-secado': ENTRY_DRYING_OVEN_CONFIG,
  'gastos-cartas': ENTRY_EXPENSE_CHART_CONFIG,
  'lavado-material': ENTRY_MATERIAL_WASH_CONFIG,
  'preparacion-soluciones': ENTRY_SOLUTION_PREP_CONFIG,
  'pesadas': ENTRY_WEIGHING_CONFIG,
  'precision': ENTRY_ACCURACY_CONFIG,
  'tratamiento-matraz': ENTRY_FLASK_TREATMENT_CONFIG
}

export function getEntryConfigBySlug(slug: string): CrudResourceConfig | undefined {
  return ENTRY_CONFIG_BY_SLUG[slug]
}
