# Análisis UI CRUD: campos técnicos (IDs) y archivos de referencia

Documento de trabajo sobre el frontend (`ccasaFrontend`): dónde la UI pide IDs u otros identificadores en lugar de selectores legibles, y qué páginas del dashboard usan el CRUD genérico.

> **Nota:** En el **anexo** final figura el contenido **completo** de `crudFields.ts`, `CrudFormDialog.tsx`, `CrudListPanel.tsx` y `DistilledWaterPanel.tsx` (copia textual del repositorio al redactar este documento). Si el código cambia, conviene actualizar esas secciones o contrastar siempre con los archivos en `ccasaFrontend`.

## Resumen

- **`CrudFormDialog`** trata `type: 'number'` como `TextField` numérico; no hay carga de opciones desde API para claves foráneas.
- **`CrudListPanel`** construye columnas con las claves del DTO (`collectCrudColumns`); la tabla muestra valores tal cual (incluidos IDs).
- **`CrudFormDialog`** no se importa directamente en páginas bajo `(dashboard)`; solo lo usa **`CrudListPanel`** cuando recibe `fields`.
- **`DistilledWaterPanel`** (ruta agua destilada) añade búsqueda por ID de entrada y un formulario con más IDs, además del listado CRUD genérico.

## Campos `type: 'number'` con etiqueta que contiene «ID» (por `CrudResourceConfig`)

Criterio: el `label` del campo incluye la subcadena `ID`.

| Config (`key`) | Campos (`key` → `label`) |
|----------------|---------------------------|
| `logbooks` | Ninguno *(el campo «Código» es numérico pero la etiqueta no contiene «ID»)* |
| `reagents` | Ninguno |
| `batches` | `reagentId` → ID Reactivo |
| `solutions` | Ninguno |
| `supplies` | Ninguno |
| `roles` | Ninguno |
| `folio-blocks` | Ninguno |
| `folios` | `folioBlockId` → ID Bloque de folios; `logbookId` → ID Bitácora |
| `alerts` | `targetUserId` → ID Usuario destino |
| `signatures` | `entryId` → ID Entrada; `supervisorUserId` → ID Supervisor |
| `users` | `roleId` → ID Rol |
| `entries` | `folioId` → ID Folio; `logbookId` → ID Bitácora; `userId` → ID Usuario |
| `entry-distilled-water` | `entryId` → ID Entrada; `waterBatchId` → ID Lote de agua |
| `entry-conductivity` | `entryId` → ID Entrada |
| `entry-oven-temp` | `entryId` → ID Entrada |
| `entry-drying-oven` | `entryId` → ID Entrada; `reagentId` → ID Reactivo; `analystUserId` → ID Analista; `supervisorUserId` → ID Supervisor |
| `entry-expense-chart` | `entryId` → ID Entrada; `batchId` → ID Lote; `kclJarId` → ID Frasco KCl |
| `entry-material-wash` | `entryId` → ID Entrada; `analystUserId` → ID Analista; `supervisorUserId` → ID Supervisor |
| `entry-solution-prep` | `entryId` → ID Entrada; `solutionId` → ID Solución; `weighingEntryId` → ID Entrada pesada; `analystUserId` → ID Analista |
| `entry-weighing` | `entryId` → ID Entrada; `reagentId` → ID Reactivo; `targetSolutionId` → ID Solución destino |
| `entry-accuracy` | `entryId` → ID Entrada; `samplerUserId` → ID Muestreador; `phLogbookId` → ID Bitácora pH |
| `entry-flask-treatment` | `entryId` → ID Entrada; `washEntryId` → ID Entrada lavado; `swabSupplyId` → ID Insumo hisopo; `supervisorUserId` → ID Supervisor |

### Otros inputs técnicos (fuera del criterio anterior)

- Campos de texto con `helperText` que piden coincidir con enums del backend (p. ej. nombre de rol, `WaterTypeEnum`).
- `LOGBOOK_CONFIG` está definido en `crudFields.ts` pero **no** aparece en el inventario de páginas dashboard siguientes con `CrudListPanel`.

## Páginas bajo `src/app/(dashboard)/` que usan `CrudListPanel` o `CrudFormDialog`

| Ruta (App Router) | Componente | Config / notas |
|-------------------|------------|----------------|
| `catalogos/frascos-reactivo/page.tsx` | `CrudListPanel` | Sin `fields` (solo lectura). `apiPath` = `getCatalogBackend('reagent-jars').crudBasePath` |
| `catalogos/insumos/page.tsx` | `CrudListPanel` | `SUPPLY_CONFIG` |
| `catalogos/soluciones/page.tsx` | `CrudListPanel` | `SOLUTION_CONFIG` |
| `catalogos/lotes/page.tsx` | `CrudListPanel` | `BATCH_CONFIG` |
| `catalogos/reactivos/page.tsx` | `CrudListPanel` | `REAGENT_CONFIG` |
| `roles/page.tsx` | `CrudListPanel` | `ROLE_CONFIG` |
| `empleados/page.tsx` | `CrudListPanel` | `USER_CONFIG` + `apiPath` desde `SUPPORT_BACKEND` (`users`) |
| `firmas/page.tsx` | `CrudListPanel` | `SIGNATURE_CONFIG` + `apiPath` desde `SUPPORT_BACKEND` (`signatures`) |
| `alertas/page.tsx` | `CrudListPanel` | `ALERT_CONFIG` + `apiPath` desde `SUPPORT_BACKEND` (`alerts`) |
| `entradas/core/page.tsx` | `CrudListPanel` | `ENTRY_CORE_CONFIG`; `apiPath` = ``${API_V1}/entries`` |
| `entradas/[slug]/page.tsx` → `EntradaTipoClient` | `CrudListPanel` | `getEntryConfigBySlug(slug)`; `apiPath` = `mod.backend.crudBasePath` |
| Misma ruta si `slug === 'agua-destilada'` | `DistilledWaterPanel` | Flujos propios además del CRUD |
| `folios/page.tsx` → `FoliosPageClient` | `CrudListPanel` ×2 | `FOLIO_BLOCK_CONFIG` y `FOLIO_CONFIG` |

**Slugs de entradas** (`/entradas/<slug>`): `agua-destilada`, `conductividad`, `temperatura-horno`, `horno-secado`, `gastos-cartas`, `lavado-material`, `preparacion-soluciones`, `pesadas`, `precision`, `tratamiento-matraz`.

**`CrudFormDialog`:** ninguna página bajo `(dashboard)` lo importa; solo se usa dentro de `CrudListPanel`.

## `DistilledWaterPanel`: etiquetas con «ID»

- Búsqueda: «ID de entrada».
- Alta: «ID Folio», «ID Bitácora», «ID Usuario», «ID Lote de agua» (opcional).
- Tabla de resultado: nombres de propiedades de API (`entryId`, `distilledWaterEntryId`, …).

## Comportamiento UI (síntesis)

1. **`CrudFormDialog`:** `boolean` → checkbox; `select` → MUI Select con `options` estáticas; `number` → `TextField type="number"`; no hay tipo «select async».
2. **`CrudListPanel`:** si no hay `fields`, no muestra botón Nuevo ni diálogos; la tabla sigue mostrando columnas derivadas de los datos.
3. **`DistilledWaterPanel`:** POST a `/api/v1/entries/distilled-water` y GET por `/api/v1/entries/{id}/distilled-water`.

---

## Anexo: contenido completo de archivos fuente

*Las secciones siguientes son copia literal de los archivos en `ccasaFrontend` (mantener sincronizado con el repo si se edita el código).*

### `ccasaFrontend/src/lib/ccasa/crudFields.ts`

```typescript
/**
 * Tipos y configuraciones para formularios CRUD dinámicos alineados con el backend.
 */

/** Cuerpo que el backend espera en POST/PUT de entidades CRUD genéricas. */
export type CrudRequestDTO = {
  values: Record<string, unknown>
}

export type CrudFieldType = 'text' | 'number' | 'textarea' | 'select' | 'date' | 'boolean'

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

  /** Columnas en grid 12 (1–12). Por defecto 12. */
  gridCols?: number
  helperText?: string

  /** Si true, el campo no se edita en actualización (solo creación). */
  readOnlyOnEdit?: boolean
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
    label: 'ID Reactivo',
    type: 'number',
    gridCols: 6,
    helperText: 'ID del reactivo asociado'
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

/** Roles — claves alineadas con CrudEntityMapper del backend. */
export const ROLE_FIELDS: CrudFieldDef[] = [
  {
    key: 'name',
    label: 'Nombre del rol',
    type: 'text',
    required: true,
    gridCols: 6,
    helperText: 'Debe coincidir con RoleNameEnum del backend'
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
    placeholder: 'Ej. 1'
  },
  {
    key: 'endNumber',
    label: 'Número fin',
    type: 'number',
    required: true,
    gridCols: 3,
    placeholder: 'Ej. 200'
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
    label: 'ID Bloque de folios',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'ID del bloque al que pertenece'
  },
  {
    key: 'logbookId',
    label: 'ID Bitácora',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'ID de la bitácora asociada'
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
    helperText: 'Formato ISO (se envía como fecha)'
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
    label: 'ID Usuario destino',
    type: 'number',
    gridCols: 6,
    helperText: 'ID del usuario al que va dirigida la alerta'
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
    helperText: 'Formato ISO'
  },
  {
    key: 'entryId',
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'ID de la entrada asociada'
  },
  {
    key: 'supervisorUserId',
    label: 'ID Supervisor',
    type: 'number',
    gridCols: 6,
    helperText: 'ID del usuario supervisor que firma'
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
  { key: 'email', label: 'Correo electrónico', type: 'text', required: true, gridCols: 6 },
  {
    key: 'passwordHash',
    label: 'Contraseña (hash)',
    type: 'text',
    gridCols: 6,
    helperText: 'Solo requerido al crear. Dejar vacío para no cambiar en edición.'
  },
  { key: 'active', label: 'Activo', type: 'boolean', defaultValue: true },
  {
    key: 'roleId',
    label: 'ID Rol',
    type: 'number',
    gridCols: 6,
    helperText: 'ID del rol asignado al usuario'
  }
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
  { key: 'recordedAt', label: 'Fecha de registro', type: 'date', gridCols: 6 },
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
    label: 'ID Folio',
    type: 'number',
    gridCols: 4,
    helperText: 'ID del folio asociado'
  },
  {
    key: 'logbookId',
    label: 'ID Bitácora',
    type: 'number',
    required: true,
    gridCols: 4,
    helperText: 'ID de la bitácora'
  },
  {
    key: 'userId',
    label: 'ID Usuario',
    type: 'number',
    gridCols: 4,
    helperText: 'ID del usuario que registra'
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
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'ID de la entrada padre'
  },
  {
    key: 'waterBatchId',
    label: 'ID Lote de agua',
    type: 'number',
    gridCols: 6,
    helperText: 'ID del lote de agua (Batch)'
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
  { key: 'weightGrams', label: 'Peso (g)', type: 'number', gridCols: 6 },
  { key: 'calculatedMol', label: 'Mol calculado', type: 'number', gridCols: 6 },
  { key: 'calculatedValue', label: 'Valor calculado', type: 'number', gridCols: 6 },
  { key: 'inRange', label: '¿En rango?', type: 'boolean' },
  { key: 'autoDate', label: 'Fecha automática', type: 'date', gridCols: 6 },
  {
    key: 'entryId',
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'ID de la entrada padre'
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
  { key: 'recordedAt', label: 'Fecha de registro', type: 'date', gridCols: 4 },
  { key: 'inRange', label: '¿En rango?', type: 'boolean' },
  { key: 'isMaintenance', label: '¿Mantenimiento?', type: 'boolean' },
  {
    key: 'entryId',
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 6,
    helperText: 'ID de la entrada padre'
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
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 4,
    helperText: 'ID de la entrada padre'
  },
  { key: 'reagentId', label: 'ID Reactivo', type: 'number', gridCols: 4 },
  { key: 'analystUserId', label: 'ID Analista', type: 'number', gridCols: 4 },
  { key: 'supervisorUserId', label: 'ID Supervisor', type: 'number', gridCols: 4 }
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
    ],
    helperText: 'Valores según WaterTypeEnum del backend'
  },
  { key: 'kclUsedG', label: 'KCl usado (g)', type: 'number', gridCols: 6 },
  { key: 'entryId', label: 'ID Entrada', type: 'number', required: true, gridCols: 4 },
  { key: 'batchId', label: 'ID Lote', type: 'number', gridCols: 4 },
  { key: 'kclJarId', label: 'ID Frasco KCl', type: 'number', gridCols: 4 }
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
    ],
    helperText: 'Valores según PieceTypeEnum del backend'
  },
  { key: 'material', label: 'Material', type: 'text', gridCols: 6 },
  { key: 'determination', label: 'Determinación', type: 'text', gridCols: 6 },
  { key: 'color', label: 'Color', type: 'text', gridCols: 4 },
  {
    key: 'entryId',
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 4,
    helperText: 'ID de la entrada padre'
  },
  { key: 'analystUserId', label: 'ID Analista', type: 'number', gridCols: 4 },
  { key: 'supervisorUserId', label: 'ID Supervisor', type: 'number', gridCols: 4 }
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
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 6
  },
  { key: 'solutionId', label: 'ID Solución', type: 'number', gridCols: 6 },
  { key: 'weighingEntryId', label: 'ID Entrada pesada', type: 'number', gridCols: 6 },
  { key: 'analystUserId', label: 'ID Analista', type: 'number', gridCols: 6 }
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
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 6
  },
  { key: 'reagentId', label: 'ID Reactivo', type: 'number', gridCols: 6 },
  { key: 'targetSolutionId', label: 'ID Solución destino', type: 'number', gridCols: 6 }
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
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 4
  },
  { key: 'samplerUserId', label: 'ID Muestreador', type: 'number', gridCols: 4 },
  { key: 'phLogbookId', label: 'ID Bitácora pH', type: 'number', gridCols: 4 }
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
    label: 'ID Entrada',
    type: 'number',
    required: true,
    gridCols: 4
  },
  { key: 'washEntryId', label: 'ID Entrada lavado', type: 'number', gridCols: 4 },
  { key: 'swabSupplyId', label: 'ID Insumo hisopo', type: 'number', gridCols: 4 },
  { key: 'supervisorUserId', label: 'ID Supervisor', type: 'number', gridCols: 4 }
]

export const ENTRY_FLASK_TREATMENT_CONFIG: CrudResourceConfig = {
  key: 'entry-flask-treatment',
  label: 'Tratamiento de matraz',
  labelPlural: 'Tratamientos de matraz',
  apiPath: '/api/v1/entry-flask-treatment',
  fields: ENTRY_FLASK_TREATMENT_FIELDS
}

/** Todas las configuraciones CRUD registradas para búsqueda por `key`. */
export const ALL_CONFIGS: CrudResourceConfig[] = [
  LOGBOOK_CONFIG,
  REAGENT_CONFIG,
  BATCH_CONFIG,
  SOLUTION_CONFIG,
  SUPPLY_CONFIG,
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
```

### `ccasaFrontend/src/components/ccasa/CrudFormDialog.tsx`

```typescript
'use client'

// React Imports
import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

// Lib Imports
import type { CrudFieldDef, CrudFieldType } from '@/lib/ccasa/crudFields'

export type CrudFormDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (values: Record<string, unknown>) => void | Promise<void>
  fields: CrudFieldDef[]
  title: string
  initialValues?: Record<string, unknown> | null
  loading?: boolean
  error?: string | null
}

function emptyDefaultForType(type: CrudFieldType): unknown {
  if (type === 'boolean') {
    return false
  }

  if (type === 'number') {
    return ''
  }

  return ''
}

function normalizeDateInitial(value: unknown): unknown {
  if (typeof value === 'string' && value.includes('T')) {
    return value.slice(0, 10)
  }

  return value
}

function buildInitialFormState(
  fields: CrudFieldDef[],
  initialValues: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const state: Record<string, unknown> = {}

  for (const field of fields) {
    let value: unknown

    if (initialValues != null && initialValues[field.key] !== undefined) {
      value = initialValues[field.key]

      if (field.type === 'date') {
        value = normalizeDateInitial(value)
      }
    } else if (field.defaultValue !== undefined) {
      value = field.defaultValue
    } else {
      value = emptyDefaultForType(field.type)
    }

    state[field.key] = value
  }

  return state
}

function isEmptyForValidation(field: CrudFieldDef, value: unknown): boolean {
  if (field.type === 'boolean') {
    return value !== true
  }

  if (value == null) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  if (field.type === 'number') {
    if (value === '') {
      return true
    }

    const n = Number(value)

    return Number.isNaN(n)
  }

  return false
}

function fieldErrorMessage(field: CrudFieldDef, value: unknown, touched: boolean): string | null {
  if (!field.required || !touched) {
    return null
  }

  if (isEmptyForValidation(field, value)) {
    return 'Este campo es obligatorio'
  }

  return null
}

function buildCleanPayload(fields: CrudFieldDef[], formState: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const field of fields) {
    const raw = formState[field.key]

    if (field.type === 'boolean') {
      out[field.key] = Boolean(raw)

      continue
    }

    if (field.type === 'number') {
      if (raw === '' || raw == null) {
        continue
      }

      const n = Number(raw)

      if (Number.isNaN(n)) {
        continue
      }

      out[field.key] = n

      continue
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim()

      if (trimmed === '') {
        continue
      }

      out[field.key] = trimmed

      continue
    }

    if (raw == null || raw === '') {
      continue
    }

    out[field.key] = raw
  }

  return out
}

const CrudFormDialog = ({
  open,
  onClose,
  onSave,
  fields,
  title,
  initialValues = null,
  loading = false,
  error = null
}: CrudFormDialogProps) => {
  const [formState, setFormState] = useState<Record<string, unknown>>(() =>
    buildInitialFormState(fields, initialValues)
  )

  const [touchedKeys, setTouchedKeys] = useState<Set<string>>(() => new Set())

  const isEditMode = initialValues != null

  useEffect(() => {
    if (!open) {
      return
    }

    setFormState(buildInitialFormState(fields, initialValues))
    setTouchedKeys(new Set())
  }, [open, initialValues, fields])

  const setValue = useCallback((key: string, value: unknown) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }, [])

  const markTouched = useCallback((key: string) => {
    setTouchedKeys(prev => {
      if (prev.has(key)) {
        return prev
      }

      const next = new Set(prev)

      next.add(key)

      return next
    })
  }, [])

  const validateAll = useCallback((): boolean => {
    for (const field of fields) {
      if (!field.required) {
        continue
      }

      if (isEmptyForValidation(field, formState[field.key])) {
        return false
      }
    }

    return true
  }, [fields, formState])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const all = new Set(fields.map(f => f.key))

    setTouchedKeys(all)

    if (!validateAll()) {
      return
    }

    const payload = buildCleanPayload(fields, formState)

    await Promise.resolve(onSave(payload))
  }

  const handleDialogClose = () => {
    if (loading) {
      return
    }

    onClose()
  }

  const isReadOnlyField = (field: CrudFieldDef): boolean => Boolean(isEditMode && field.readOnlyOnEdit)

  const primaryLabel = isEditMode ? 'Actualizar' : 'Crear'

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth='sm'
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 3 }}>{title}</DialogTitle>
      <form onSubmit={e => void handleSubmit(e)} noValidate>
        <DialogContent sx={{ pt: '24px !important' }}>
          {error ? (
            <Alert severity='error' className='mbe-4'>
              {error}
            </Alert>
          ) : null}
          <Grid container spacing={3}>
            {fields.map(field => {
              const value = formState[field.key]
              const touched = touchedKeys.has(field.key)
              const errMsg = fieldErrorMessage(field, value, touched)
              const readOnly = isReadOnlyField(field)
              const gridSm = field.gridCols != null && field.gridCols >= 1 && field.gridCols <= 12 ? field.gridCols : 12

              const showFieldError = Boolean(errMsg)

              if (field.type === 'boolean') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <FormControl error={showFieldError} fullWidth>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(value)}
                            disabled={loading || readOnly}
                            onChange={e => {
                              markTouched(field.key)
                              setValue(field.key, e.target.checked)
                            }}
                            name={field.key}
                          />
                        }
                        label={field.label}
                      />
                      {field.helperText && !showFieldError ? (
                        <FormHelperText>{field.helperText}</FormHelperText>
                      ) : null}
                      {showFieldError ? <FormHelperText>{errMsg}</FormHelperText> : null}
                    </FormControl>
                  </Grid>
                )
              }

              if (field.type === 'select') {
                const selectVal =
                  value === undefined || value === null || value === '' ? '' : (value as string | number)

                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <FormControl fullWidth error={showFieldError} margin='normal' disabled={loading || readOnly}>
                      <InputLabel id={`${field.key}-label`} shrink>
                        {field.label}
                        {field.required ? ' *' : ''}
                      </InputLabel>
                      <Select
                        labelId={`${field.key}-label`}
                        label={`${field.label}${field.required ? ' *' : ''}`}
                        notched
                        value={selectVal}
                        onChange={e => {
                          markTouched(field.key)
                          setValue(field.key, e.target.value)
                        }}
                        onBlur={() => markTouched(field.key)}
                      >
                        {!field.required ? <MenuItem value=''>—</MenuItem> : null}
                        {(field.options ?? []).map(opt => (
                          <MenuItem key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {field.helperText && !showFieldError ? <FormHelperText>{field.helperText}</FormHelperText> : null}
                      {showFieldError ? <FormHelperText>{errMsg}</FormHelperText> : null}
                    </FormControl>
                  </Grid>
                )
              }

              const commonTextFieldProps = {
                fullWidth: true,
                margin: 'normal' as const,
                label: `${field.label}${field.required ? ' *' : ''}`,
                error: showFieldError,
                helperText: showFieldError ? errMsg : field.helperText,
                placeholder: field.placeholder,
                disabled: loading,
                InputProps: readOnly ? { readOnly: true } : undefined,
                onBlur: () => markTouched(field.key)
              }

              if (field.type === 'textarea') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <TextField
                      {...commonTextFieldProps}
                      multiline
                      minRows={3}
                      value={value ?? ''}
                      onChange={e => {
                        markTouched(field.key)
                        setValue(field.key, e.target.value)
                      }}
                    />
                  </Grid>
                )
              }

              if (field.type === 'date') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <TextField
                      {...commonTextFieldProps}
                      type='date'
                      InputLabelProps={{ shrink: true }}
                      value={value ?? ''}
                      onChange={e => {
                        markTouched(field.key)
                        setValue(field.key, e.target.value)
                      }}
                    />
                  </Grid>
                )
              }

              if (field.type === 'number') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <TextField
                      {...commonTextFieldProps}
                      type='number'
                      value={value ?? ''}
                      onChange={e => {
                        markTouched(field.key)
                        setValue(field.key, e.target.value)
                      }}
                    />
                  </Grid>
                )
              }

              return (
                <Grid item xs={12} sm={gridSm} key={field.key}>
                  <TextField
                    {...commonTextFieldProps}
                    value={value ?? ''}
                    onChange={e => {
                      markTouched(field.key)
                      setValue(field.key, e.target.value)
                    }}
                  />
                </Grid>
              )
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3 }}>
          <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' sx={{ minWidth: 120 }} disabled={loading}>
            {primaryLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CrudFormDialog
```

### `ccasaFrontend/src/components/ccasa/CrudListPanel.tsx`

```typescript
'use client'

// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import { collectCrudColumns, formatCrudCell } from '@/lib/ccasa/crudDisplay'
import type { CrudFieldDef } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

// Hook Imports
import { useCrudOperations } from '@/hooks/ccasa/useCrudOperations'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Component Imports
import CrudDeleteDialog from './CrudDeleteDialog'
import CrudFormDialog from './CrudFormDialog'

export type CrudListPanelProps = {

  /** Path API, p. ej. /api/v1/users */
  apiPath: string
  title?: string
  subtitle?: string
  showCard?: boolean

  /** Si se define y tiene al menos un campo, se habilitan crear/editar/eliminar. */
  fields?: CrudFieldDef[]

  /** Etiqueta singular para diálogos (p. ej. "Reactivo"). */
  resourceLabel?: string

  /** Clave en `values` usada como nombre en el diálogo de eliminar. */
  nameColumn?: string
}

function rowDisplayName(values: Record<string, unknown> | undefined, nameColumn: string): string | undefined {
  if (!values || !(nameColumn in values)) {
    return undefined
  }

  const v = values[nameColumn]

  if (v === null || v === undefined) {
    return undefined
  }

  const s = String(v).trim()

  return s === '' ? undefined : s
}

const CrudListPanel = ({
  apiPath,
  title = 'Registros',
  subtitle,
  showCard = true,
  fields,
  resourceLabel = 'Registro',
  nameColumn = 'name'
}: CrudListPanelProps) => {
  const { token } = useAuth()

  const {
    loading: crudLoading,
    error: crudError,
    create: crudCreate,
    update: crudUpdate,
    remove: crudRemove,
    clearError: crudClearError
  } = useCrudOperations()

  const hasWrite = fields != null && fields.length > 0

  const [rows, setRows] = useState<CrudResponseDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<CrudResponseDTO | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRow, setDeletingRow] = useState<CrudResponseDTO | null>(null)

  const [snackbar, setSnackbar] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await apiFetch<CrudResponseDTO[]>(apiPath)

      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [token, apiPath])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  const columns = useMemo(() => (rows && rows.length > 0 ? collectCrudColumns(rows) : ['id']), [rows])

  const handleOpenCreate = useCallback(() => {
    crudClearError()
    setEditingRow(null)
    setFormOpen(true)
  }, [crudClearError])

  const handleOpenEdit = useCallback(
    (row: CrudResponseDTO) => {
      crudClearError()
      setEditingRow(row)
      setFormOpen(true)
    },
    [crudClearError]
  )

  const handleCloseForm = useCallback(() => {
    if (crudLoading) {
      return
    }

    crudClearError()
    setFormOpen(false)
    setEditingRow(null)
  }, [crudClearError, crudLoading])

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      if (editingRow) {
        const res = await crudUpdate(apiPath, editingRow.id, values)

        if (res) {
          setFormOpen(false)
          setEditingRow(null)
          crudClearError()
          setSnackbar(`${resourceLabel} actualizado correctamente`)
          void fetchRows()
        }
      } else {
        const res = await crudCreate(apiPath, values)

        if (res) {
          setFormOpen(false)
          setEditingRow(null)
          crudClearError()
          setSnackbar(`${resourceLabel} creado correctamente`)
          void fetchRows()
        }
      }
    },
    [apiPath, crudClearError, crudCreate, crudUpdate, editingRow, fetchRows, resourceLabel]
  )

  const handleOpenDelete = useCallback(
    (row: CrudResponseDTO) => {
      crudClearError()
      setDeletingRow(row)
      setDeleteOpen(true)
    },
    [crudClearError]
  )

  const handleCloseDelete = useCallback(() => {
    if (crudLoading) {
      return
    }

    crudClearError()
    setDeleteOpen(false)
    setDeletingRow(null)
  }, [crudClearError, crudLoading])

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingRow) {
      return
    }

    const ok = await crudRemove(apiPath, deletingRow.id)

    if (ok) {
      setDeleteOpen(false)
      setDeletingRow(null)
      crudClearError()
      setSnackbar(`${resourceLabel} eliminado correctamente`)
      void fetchRows()
    }
  }, [apiPath, crudClearError, crudRemove, deletingRow, fetchRows, resourceLabel])

  const formTitle = editingRow ? `Editar ${resourceLabel.toLowerCase()}` : `Nuevo ${resourceLabel.toLowerCase()}`

  const inner = (
    <>
      {subtitle ? (
        <Typography variant='body2' color='text.secondary' className='mbe-4'>
          {subtitle}
        </Typography>
      ) : null}
      {loading ? (
        <Box className='flex justify-center p-6'>
          <CircularProgress size={28} />
        </Box>
      ) : null}
      {error ? (
        <Alert severity='error' className='mbe-4'>
          {error}
        </Alert>
      ) : null}
      {!loading && !error && rows ? (
        <>
          <Typography variant='body2' color='text.secondary' className='mbe-2'>
            {rows.length} registro{rows.length === 1 ? '' : 's'}
          </Typography>
          {hasWrite ? (
            <Stack direction='row' justifyContent='flex-end' className='mbe-2'>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={handleOpenCreate}
                disabled={!token}
              >
                Nuevo
              </Button>
            </Stack>
          ) : null}
          {rows.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No hay registros activos.
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map(col => (
                      <TableCell key={col}>{col}</TableCell>
                    ))}
                    {hasWrite ? <TableCell align='right'>Acciones</TableCell> : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.id} hover>
                      {columns.map(col => (
                        <TableCell key={col}>
                          {col === 'id' ? formatCrudCell(row.id) : formatCrudCell(row.values?.[col])}
                        </TableCell>
                      ))}
                      {hasWrite ? (
                        <TableCell align='right'>
                          <Tooltip title='Editar'>
                            <IconButton
                              size='small'
                              aria-label='Editar'
                              onClick={() => handleOpenEdit(row)}
                            >
                              <i className='ri-pencil-line' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Eliminar'>
                            <IconButton
                              color='error'
                              size='small'
                              aria-label='Eliminar'
                              onClick={() => handleOpenDelete(row)}
                            >
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : null}
    </>
  )

  const shell = showCard ? (
    <Card variant='outlined'>
      <CardHeader title={title} titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>{inner}</CardContent>
    </Card>
  ) : (
    inner
  )

  if (!hasWrite) {
    return shell
  }

  return (
    <>
      {shell}
      <CrudFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        fields={fields}
        title={formTitle}
        initialValues={editingRow ? { ...editingRow.values } : null}
        loading={crudLoading}
        error={crudError}
      />
      <CrudDeleteDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        resourceLabel={resourceLabel}
        itemLabel={rowDisplayName(deletingRow?.values, nameColumn)}
        loading={crudLoading}
        error={crudError}
      />
      <Snackbar
        open={snackbar != null}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}

export default CrudListPanel
```

### `ccasaFrontend/src/components/ccasa/DistilledWaterPanel.tsx`

```typescript
'use client'

// React Imports
import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import type { DistilledWaterRequestDTO, DistilledWaterResponseDTO } from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_FORM: Record<string, string> = {
  folioId: '',
  logbookId: '',
  userId: '',
  phReading1: '',
  phReading2: '',
  phReading3: '',
  ceReading1: '',
  ceReading2: '',
  ceReading3: '',
  referenceDifference: '',
  controlStandardPct: '',
  waterBatchId: ''
}

type FormFieldConfig = {
  key: keyof typeof EMPTY_FORM
  label: string
  required?: boolean
  md: number
}

const FORM_FIELDS: FormFieldConfig[] = [
  { key: 'folioId', label: 'ID Folio', required: true, md: 4 },
  { key: 'logbookId', label: 'ID Bitácora', required: true, md: 4 },
  { key: 'userId', label: 'ID Usuario', required: true, md: 4 },
  { key: 'phReading1', label: 'pH Lectura 1', md: 4 },
  { key: 'phReading2', label: 'pH Lectura 2', md: 4 },
  { key: 'phReading3', label: 'pH Lectura 3', md: 4 },
  { key: 'ceReading1', label: 'CE Lectura 1', md: 4 },
  { key: 'ceReading2', label: 'CE Lectura 2', md: 4 },
  { key: 'ceReading3', label: 'CE Lectura 3', md: 4 },
  { key: 'referenceDifference', label: 'Diferencia referencia', md: 6 },
  { key: 'controlStandardPct', label: 'Estándar control %', md: 6 },
  { key: 'waterBatchId', label: 'ID Lote de agua', md: 6 }
]

function formatCell(value: number | string | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  return String(value)
}

function responseToTableRows(d: DistilledWaterResponseDTO): { field: string; value: string }[] {
  return [
    { field: 'entryId', value: formatCell(d.entryId) },
    { field: 'distilledWaterEntryId', value: formatCell(d.distilledWaterEntryId) },
    { field: 'phReading1', value: formatCell(d.phReading1) },
    { field: 'phReading2', value: formatCell(d.phReading2) },
    { field: 'phReading3', value: formatCell(d.phReading3) },
    { field: 'phAverage', value: formatCell(d.phAverage) },
    { field: 'ceReading1', value: formatCell(d.ceReading1) },
    { field: 'ceReading2', value: formatCell(d.ceReading2) },
    { field: 'ceReading3', value: formatCell(d.ceReading3) },
    { field: 'ceAverage', value: formatCell(d.ceAverage) },
    { field: 'referenceDifference', value: formatCell(d.referenceDifference) },
    { field: 'controlStandardPct', value: formatCell(d.controlStandardPct) },
    {
      field: 'isAcceptable',
      value: d.isAcceptable === null ? '—' : d.isAcceptable ? 'Sí' : 'No'
    },
    { field: 'waterBatchId', value: formatCell(d.waterBatchId) },
    { field: 'entryStatus', value: formatCell(d.entryStatus) }
  ]
}

function parseOptionalNumber(raw: string): number | undefined {
  const t = raw.trim()

  if (t === '') {
    return undefined
  }

  const n = Number(t)

  return Number.isFinite(n) ? n : undefined
}

function buildCreateDto(form: Record<string, string>): { ok: true; dto: DistilledWaterRequestDTO } | { ok: false; message: string } {
  const folioId = Number(form.folioId?.trim())
  const logbookId = Number(form.logbookId?.trim())
  const userId = Number(form.userId?.trim())

  if (!form.folioId?.trim() || !Number.isFinite(folioId)) {
    return { ok: false, message: 'ID Folio es obligatorio y debe ser un número válido.' }
  }

  if (!form.logbookId?.trim() || !Number.isFinite(logbookId)) {
    return { ok: false, message: 'ID Bitácora es obligatorio y debe ser un número válido.' }
  }

  if (!form.userId?.trim() || !Number.isFinite(userId)) {
    return { ok: false, message: 'ID Usuario es obligatorio y debe ser un número válido.' }
  }

  const dto: DistilledWaterRequestDTO = { folioId, logbookId, userId }

  const ph1 = parseOptionalNumber(form.phReading1 ?? '')

  if (ph1 !== undefined) dto.phReading1 = ph1
  const ph2 = parseOptionalNumber(form.phReading2 ?? '')

  if (ph2 !== undefined) dto.phReading2 = ph2
  const ph3 = parseOptionalNumber(form.phReading3 ?? '')

  if (ph3 !== undefined) dto.phReading3 = ph3

  const ce1 = parseOptionalNumber(form.ceReading1 ?? '')

  if (ce1 !== undefined) dto.ceReading1 = ce1
  const ce2 = parseOptionalNumber(form.ceReading2 ?? '')

  if (ce2 !== undefined) dto.ceReading2 = ce2
  const ce3 = parseOptionalNumber(form.ceReading3 ?? '')

  if (ce3 !== undefined) dto.ceReading3 = ce3

  const refDiff = parseOptionalNumber(form.referenceDifference ?? '')

  if (refDiff !== undefined) dto.referenceDifference = refDiff
  const ctrl = parseOptionalNumber(form.controlStandardPct ?? '')

  if (ctrl !== undefined) dto.controlStandardPct = ctrl
  const batch = parseOptionalNumber(form.waterBatchId ?? '')

  if (batch !== undefined) dto.waterBatchId = batch

  return { ok: true, dto }
}

function DistilledWaterResultTable({ data }: { data: DistilledWaterResponseDTO }) {
  const rows = responseToTableRows(data)

  return (
    <TableContainer>
      <Table size='small'>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.field}>
              <TableCell component='th' scope='row' sx={{ fontWeight: 600, width: '40%' }}>
                {row.field}
              </TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const DistilledWaterPanel = () => {
  const { token, hydrated } = useAuth()

  const [searchId, setSearchId] = useState('')
  const [result, setResult] = useState<DistilledWaterResponseDTO | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [formState, setFormState] = useState<Record<string, string>>(() => ({ ...EMPTY_FORM }))
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createResult, setCreateResult] = useState<DistilledWaterResponseDTO | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!token) {
      return
    }

    setSearchError(null)
    const id = searchId.trim()

    if (!id) {
      setSearchError('Ingresa un ID de entrada.')
      setResult(null)

      return
    }

    if (!Number.isFinite(Number(id))) {
      setSearchError('El ID de entrada debe ser un número válido.')
      setResult(null)

      return
    }

    setSearching(true)
    setResult(null)

    try {
      const data = await apiFetch<DistilledWaterResponseDTO>(`/api/v1/entries/${encodeURIComponent(id)}/distilled-water`)

      setResult(data)
    } catch (e) {
      setResult(null)
      setSearchError(e instanceof Error ? e.message : 'Error al consultar')
    } finally {
      setSearching(false)
    }
  }, [token, searchId])

  const handleCreateSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!token) {
        return
      }

      setCreateError(null)
      setCreateSuccess(false)

      const built = buildCreateDto(formState)

      if (!built.ok) {
        setCreateError(built.message)

        return
      }

      setCreating(true)

      try {
        const data = await apiFetch<DistilledWaterResponseDTO>('/api/v1/entries/distilled-water', {
          method: 'POST',
          body: JSON.stringify(built.dto)
        })

        setCreateResult(data)
        setCreateSuccess(true)
        setFormState({ ...EMPTY_FORM })
        setSnackbarOpen(true)
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Error al crear la entrada')
      } finally {
        setCreating(false)
      }
    },
    [token, formState]
  )

  const noToken = hydrated && !token

  return (
    <Stack spacing={4}>
      {noToken ? (
        <Alert severity='warning'>Inicia sesión para consultar y crear entradas de agua destilada.</Alert>
      ) : null}

      <Card variant='outlined'>
        <CardHeader title='Consultar agua destilada por entrada' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <TextField
                label='ID de entrada'
                type='text'
                value={searchId}
                onChange={ev => setSearchId(ev.target.value)}
                disabled={!token || searching}
                size='small'
                sx={{ minWidth: 200 }}
                inputProps={{ inputMode: 'numeric' }}
              />
              <Button variant='contained' onClick={() => void handleSearch()} disabled={!token || searching}>
                Consultar
              </Button>
              {searching ? <CircularProgress size={24} /> : null}
            </Stack>

            {searchError ? <Alert severity='error'>{searchError}</Alert> : null}

            {!searching && result ? <DistilledWaterResultTable data={result} /> : null}

            {!searching && !searchError && !result ? (
              <Typography variant='body2' color='text.secondary'>
                Ingresa un ID de entrada para consultar
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardHeader title='Nueva entrada de agua destilada (dominio)' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Box component='form' onSubmit={handleCreateSubmit}>
            <Grid container spacing={2}>
              {FORM_FIELDS.map(f => (
                <Grid key={f.key} item xs={12} md={f.md}>
                  <TextField
                    label={f.label}
                    name={f.key}
                    type='text'
                    required={f.required}
                    fullWidth
                    size='small'
                    value={formState[f.key] ?? ''}
                    onChange={ev => setFormState(prev => ({ ...prev, [f.key]: ev.target.value }))}
                    disabled={!token || creating}
                    inputProps={f.key !== 'folioId' && f.key !== 'logbookId' && f.key !== 'userId' ? { inputMode: 'decimal' } : { inputMode: 'numeric' }}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button type='submit' variant='contained' disabled={!token || creating}>
                  Crear entrada
                </Button>
                {creating ? (
                  <CircularProgress size={24} sx={{ ml: 2, verticalAlign: 'middle' }} />
                ) : null}
              </Grid>
            </Grid>
          </Box>

          {createError ? (
            <Alert severity='error' sx={{ mt: 2 }}>
              {createError}
            </Alert>
          ) : null}

          {createSuccess && createResult ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant='subtitle2' className='mbe-2'>
                Resultado
              </Typography>
              <DistilledWaterResultTable data={createResult} />
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message='Entrada de agua destilada creada'
      />
    </Stack>
  )
}

export default DistilledWaterPanel
```

