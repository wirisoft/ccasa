# ccasaFrontend — Resumen para otro asistente de IA

Paquete de contexto del frontend **ccasaFrontend**: convenciones CRUD/API, estructura de `src/`, tipos compartidos y contenido íntegro de archivos clave. El panel de bitácoras está en `src/components/ccasa/LogbooksPanel.tsx` (no bajo `bitacoras/`).

---

## Convenciones (CRUD / API)

- **Base API**: `NEXT_PUBLIC_API_BASE_URL` (sin barra final); por defecto `http://localhost:8080`. Rutas REST bajo `/api/v1/...`.
- **Cliente HTTP**: `apiFetch` en `src/lib/ccasa/api.ts` — añade `Accept: application/json`, `Content-Type: application/json` si el body es string, `Authorization: Bearer <token>` salvo `skipAuth`, maneja 204 y cuerpo vacío.
- **Token y perfil**: JWT en `localStorage` (`ccasa_access_token`); email, rol y userId en claves `ccasa_user_*` vía `AuthContext`.
- **Listados CRUD genéricos**: el backend devuelve `CrudResponseDTO[]` (`{ id, values: Record<string, unknown> }`). `CrudListPanel` usa `collectCrudColumns` / `formatCrudCell` (máx. 14 columnas además de `id`).
- **Registro de endpoints**: `backendApiRegistry.ts` documenta paths por recurso; `ccasaModules.ts` enlaza cada **slug** de entrada con `ENTRADA_BACKEND_BY_SLUG` y metadatos de documentación.
- **Rutas UI**: ver `VerticalMenu.tsx` (Inicio, Bitácoras, Folios, Entradas por slug, catálogos, etc.).

---

## Estructura de carpetas `src/` (2 niveles desde `src/`)

```
src/@core/
src/@core/components/
src/@core/contexts/
src/@core/hooks/
src/@core/styles/
src/@core/svg/
src/@core/tailwind/
src/@core/theme/
src/@core/utils/
src/@layouts/
src/@layouts/components/
src/@layouts/styles/
src/@layouts/utils/
src/@menu/
src/@menu/components/
src/@menu/contexts/
src/@menu/hooks/
src/@menu/styles/
src/@menu/svg/
src/@menu/utils/
src/@menu/vertical-menu/
src/app/
src/app/(blank-layout-pages)/
src/app/(dashboard)/
src/app/[...not-found]/
src/assets/
src/assets/iconify-icons/
src/components/
src/components/card-statistics/
src/components/ccasa/
src/components/layout/
src/components/stepper-dot/
src/components/theme/
src/components/upgrade-to-pro-button/
src/configs/
src/contexts/
src/lib/
src/lib/ccasa/
src/libs/
src/libs/styles/
src/types/
src/types/pages/
src/utils/
src/views/
src/views/account-settings/
src/views/card-basic/
src/views/dashboard/
src/views/form-layouts/
src/views/pages/
```

*(No hay archivos sueltos en la raíz de `src/` en este repo.)*

---

## Tipos e interfaces compartidas relevantes

Incluidos más abajo **completos**: `src/lib/ccasa/types.ts` y `src/lib/ccasa/crudDisplay.ts`.

En `src/configs/backendApiRegistry.ts` también viven tipos útiles: `BackendExtraEndpoint`, `EntradaBackendConfig`, `CoreBackendResource`, `CatalogBackendResource`, `SupportBackendResource` (contenido completo en su bloque).

---

## Notas para implementar formularios CRUD

Para formularios de escritura, el registro indica `CrudRequestDTO` en backend (ver comentarios en `CORE_BACKEND` / `ABSTRACT_CRUD_OPERATIONS`); el front aún no define `CrudRequestDTO` en TypeScript: conviene alinearlo con el DTO Java al implementar POST/PUT.

**Auth relacionado:** además de `AuthContext`, existen `src/components/ccasa/AuthGuard.tsx` y `AuthRootProvider.tsx` si se necesita el flujo de protección de rutas.

---

## `src/lib/ccasa/api.ts`

```typescript
const STORAGE_KEY = 'ccasa_access_token'

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  return raw.replace(/\/$/, '')
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null

  return window.localStorage.getItem(STORAGE_KEY)
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return

  if (token) {
    window.localStorage.setItem(STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string }

    return data.message || data.error || res.statusText
  } catch {
    return res.statusText
  }
}

export type ApiFetchOptions = RequestInit & {

  /** Si no se pasa, se usa el token guardado (solo cliente) */
  token?: string | null

  /** true = no enviar Authorization */
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, skipAuth, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const body = rest.body

  if (body != null && typeof body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!skipAuth) {
    const authToken = token !== undefined ? token : getStoredAccessToken()

    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }
  }

  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, { ...rest, headers })

  if (!res.ok) {
    const msg = await parseErrorResponse(res)

    throw new Error(msg || `HTTP ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()

  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}
```

---

## `src/components/ccasa/CrudListPanel.tsx`

```tsx
'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import { collectCrudColumns, formatCrudCell } from '@/lib/ccasa/crudDisplay'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

export type CrudListPanelProps = {

  /** Path API, p. ej. /api/v1/users */
  apiPath: string
  title?: string
  subtitle?: string
  showCard?: boolean
}

const CrudListPanel = ({
  apiPath,
  title = 'Registros',
  subtitle,
  showCard = true
}: CrudListPanelProps) => {
  const { token } = useAuth()
  const [rows, setRows] = useState<CrudResponseDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await apiFetch<CrudResponseDTO[]>(apiPath)

        if (!cancelled) setRows(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar datos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [token, apiPath])

  const columns = useMemo(() => (rows && rows.length > 0 ? collectCrudColumns(rows) : ['id']), [rows])

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
            <code>{`GET ${apiPath}`}</code> — {rows.length} registro{rows.length === 1 ? '' : 's'}.
          </Typography>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.id} hover>
                      {columns.map(col => (
                        <TableCell key={col}>
                          {col === 'id'
                            ? formatCrudCell(row.id)
                            : formatCrudCell(row.values?.[col])}
                        </TableCell>
                      ))}
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

  if (!showCard) {
    return inner
  }

  return (
    <Card variant='outlined'>
      <CardHeader title={title} titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>{inner}</CardContent>
    </Card>
  )
}

export default CrudListPanel
```

---

## `src/configs/backendApiRegistry.ts`

```typescript
/**
 * Registro de la API real del backend (Spring Boot, AbstractCrudController, controladores dedicados).
 * Convención: path params al final. Base común /api/v1.
 *
 * Fuente: paquete com.backend.ccasa.controllers (Java)
 */

export const API_V1 = '/api/v1'

/**
 * Operaciones que aporta AbstractCrudController en cada *CrudController
 */
export const ABSTRACT_CRUD_OPERATIONS =
  'POST (crear) · GET (listar activos) · GET /{id} · PUT /{id} · DELETE /{id}'

export type BackendExtraEndpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

  /** Path completo desde la raíz de la API (incluye /api/v1/...) */
  path: string
  label: string
}

/**
 * Configuración backend por tipo de entrada (tabla hija + Entry)
 */
export type EntradaBackendConfig = {

  /**
   * Base del *CrudController (CRUD genérico CrudRequestDTO / CrudResponseDTO)
   */
  crudBasePath: string

  /**
   * Clase Java de referencia para el desarrollador front
   */
  controllerCrud: string

  /**
   * Endpoints de dominio además del CRUD (si existen)
   */
  extraEndpoints?: BackendExtraEndpoint[]
}

/**
 * Mapeo slug de UI → backend. Solo agua destilada tiene endpoints adicionales bajo /entries (RF-08).
 */
export const ENTRADA_BACKEND_BY_SLUG: Record<string, EntradaBackendConfig> = {
  'agua-destilada': {
    crudBasePath: `${API_V1}/entry-distilled-water`,
    controllerCrud: 'EntryDistilledWaterCrudController',
    extraEndpoints: [
      {
        method: 'GET',
        path: `${API_V1}/entries/{entryId}/distilled-water`,
        label: 'Detalle por entryId (DistilledWaterResponseDTO) — DistilledWaterController'
      },
      {
        method: 'POST',
        path: `${API_V1}/entries/distilled-water`,
        label: 'Alta con DistilledWaterRequestDTO — DistilledWaterController'
      }
    ]
  },
  conductividad: {
    crudBasePath: `${API_V1}/entry-conductivity`,
    controllerCrud: 'EntryConductivityCrudController'
  },
  'temperatura-horno': {
    crudBasePath: `${API_V1}/entry-oven-temp`,
    controllerCrud: 'EntryOvenTempCrudController'
  },
  'horno-secado': {
    crudBasePath: `${API_V1}/entry-drying-oven`,
    controllerCrud: 'EntryDryingOvenCrudController'
  },
  'gastos-cartas': {
    crudBasePath: `${API_V1}/entry-expense-chart`,
    controllerCrud: 'EntryExpenseChartCrudController'
  },
  'lavado-material': {
    crudBasePath: `${API_V1}/entry-material-wash`,
    controllerCrud: 'EntryMaterialWashCrudController'
  },
  'preparacion-soluciones': {
    crudBasePath: `${API_V1}/entry-solution-prep`,
    controllerCrud: 'EntrySolutionPrepCrudController'
  },
  pesadas: {
    crudBasePath: `${API_V1}/entry-weighing`,
    controllerCrud: 'EntryWeighingCrudController'
  },
  precision: {
    crudBasePath: `${API_V1}/entry-accuracy`,
    controllerCrud: 'EntryAccuracyCrudController'
  },
  'tratamiento-matraz': {
    crudBasePath: `${API_V1}/entry-flask-treatment`,
    controllerCrud: 'EntryFlaskTreatmentCrudController'
  }
}

export type CoreBackendResource = {
  key: string
  label: string
  crudBasePath?: string
  extraEndpoints?: BackendExtraEndpoint[]
  notes?: string
  controllerHint?: string
}

/** Core: bitácoras, entradas genéricas, folios */
export const CORE_BACKEND: CoreBackendResource[] = [
  {
    key: 'logbooks',
    label: 'Bitácoras',
    crudBasePath: `${API_V1}/logbooks`,
    extraEndpoints: [
      { method: 'GET', path: `${API_V1}/logbooks`, label: 'Listar activas (LogbookDTO[]) — ILogbookService' },
      { method: 'GET', path: `${API_V1}/logbooks/{id}`, label: 'Detalle por id' }
    ],
    notes: 'POST/PUT/DELETE usan LogbookCrudService + CrudRequestDTO/CrudResponseDTO.',
    controllerHint: 'LogbookController'
  },
  {
    key: 'entries',
    label: 'Entradas (genérico)',
    crudBasePath: `${API_V1}/entries`,
    extraEndpoints: [
      {
        method: 'GET',
        path: `${API_V1}/entries/by-logbook/{logbookId}`,
        label: 'Listado resumen por bitácora (EntrySummaryDTO[]) — EntryController'
      }
    ],
    notes: 'CRUD sobre Entry vía EntryCrudController (misma base /entries).',
    controllerHint: 'EntryCrudController + EntryController'
  },
  {
    key: 'folios',
    label: 'Folios',
    crudBasePath: `${API_V1}/folios`,
    controllerHint: 'FolioCrudController'
  },
  {
    key: 'folio-blocks',
    label: 'Bloques de folios',
    crudBasePath: `${API_V1}/folio-blocks`,
    controllerHint: 'FolioBlockCrudController'
  }
]

export type CatalogBackendResource = {
  key: string
  label: string
  crudBasePath: string
  controllerHint: string

  /** Si no hay entidad en el backend aún */
  notImplemented?: boolean
}

export const CATALOG_BACKEND: CatalogBackendResource[] = [
  { key: 'reagents', label: 'Reactivos', crudBasePath: `${API_V1}/reagents`, controllerHint: 'ReagentCrudController' },
  {
    key: 'reagent-jars',
    label: 'Frascos de reactivo',
    crudBasePath: `${API_V1}/reagent-jars`,
    controllerHint: 'ReagentJarCrudController'
  },
  { key: 'batches', label: 'Lotes', crudBasePath: `${API_V1}/batches`, controllerHint: 'BatchCrudController' },
  {
    key: 'solutions',
    label: 'Soluciones',
    crudBasePath: `${API_V1}/solutions`,
    controllerHint: 'SolutionCrudController'
  },
  {
    key: 'supplies',
    label: 'Insumos',
    crudBasePath: `${API_V1}/supplies`,
    controllerHint: 'SupplyCrudController'
  },
  {
    key: 'equipment',
    label: 'Equipos (Listados.xlsx)',
    crudBasePath: '',
    controllerHint: '—',
    notImplemented: true
  }
]

export type SupportBackendResource = {
  key: string
  label: string
  crudBasePath: string
  controllerHint: string
}

export const SUPPORT_BACKEND: SupportBackendResource[] = [
  { key: 'alerts', label: 'Alertas', crudBasePath: `${API_V1}/alerts`, controllerHint: 'AlertCrudController' },
  {
    key: 'signatures',
    label: 'Firmas',
    crudBasePath: `${API_V1}/signatures`,
    controllerHint: 'SignatureCrudController'
  },
  { key: 'users', label: 'Usuarios', crudBasePath: `${API_V1}/users`, controllerHint: 'UserCrudController' },
  { key: 'roles', label: 'Roles', crudBasePath: `${API_V1}/roles`, controllerHint: 'RoleCrudController' }
]

/**
 * Auth: permitAll `/api/v1/auth/**` (SecurityConfiguration).
 * Respuesta: AuthResponseDTO { token, userId, email, role } — AuthController + IAuthService.
 */
export const AUTH_BACKEND: BackendExtraEndpoint[] = [
  { method: 'POST', path: `${API_V1}/auth/login`, label: 'AuthLoginRequestDTO → AuthResponseDTO (JWT en token)' },
  { method: 'POST', path: `${API_V1}/auth/register`, label: 'AuthRegisterRequestDTO → AuthResponseDTO' },
  {
    method: 'POST',
    path: `${API_V1}/auth/init-admin`,
    label: 'Bootstrap admin si aplica (dev) → AuthResponseDTO'
  }
]

/** Multi-tenant en JWT (tenantId); sin TenantController en controllers a la fecha */
export const PLATFORM_BACKEND_NOTE =
  'No hay controlador REST de tenants en ccasaBackend; la documentación (PROPUESTA_SOFTWARE_MODULAR) define el módulo plataforma para Super Admin.'

export function getEntradaBackend(slug: string): EntradaBackendConfig | undefined {
  return ENTRADA_BACKEND_BY_SLUG[slug]
}

export function getCatalogBackend(key: string): CatalogBackendResource | undefined {
  return CATALOG_BACKEND.find(c => c.key === key)
}
```

---

## `src/configs/ccasaModules.ts`

```typescript
/**
 * Módulos de interfaz alineados con documentación + backendApiRegistry (API real).
 */

import type { EntradaBackendConfig } from './backendApiRegistry'
import { ENTRADA_BACKEND_BY_SLUG } from './backendApiRegistry'

export type EntradaModulo = {
  slug: string
  label: string
  iconClass: string

  /** Contrato REST del *CrudController y endpoints de dominio (p. ej. agua destilada) */
  backend: EntradaBackendConfig
  docRef: string
  excelEspecificacionesHint: string
  analisisResultadosHint: string
}

const RAW_ENTRADA_MODULOS: Omit<EntradaModulo, 'backend'>[] = [
  {
    slug: 'agua-destilada',
    label: 'Agua destilada',
    iconClass: 'ri-drop-line',
    docRef: 'RF-08 · Excel 1-AGUA DESTILADA',
    excelEspecificacionesHint:
      '§1 · Hojas PORTADA/BITACORA/BD; 1-MT-02/03: FOLIO, PH, CE, INICIALES, FIRMA; mapeo ENTRY_DISTILLED_WATER + BATCH.',
    analisisResultadosHint:
      '§2.1 base ya construida (agua destilada) · §3.1 patrón Entity+Service+DTO+Controller; import/export opcional según EXCEL_ESPECIFICACIONES.'
  },
  {
    slug: 'conductividad',
    label: 'Conductividad (alta / baja)',
    iconClass: 'ri-flashlight-line',
    docRef: 'RF-05 · Excel 2 y 3',
    excelEspecificacionesHint:
      '§2-3 · Hojas por fecha YYYYMMDD (14 cols); baja: hoja BD con F DISOLVENTE, F BALANZA, F HORNO, MCF; ENTRY_CONDUCTIVITY High/Low.',
    analisisResultadosHint: '§2.2 tabla · fila 1 · import Excel por hoja/fecha opcional.'
  },
  {
    slug: 'temperatura-horno',
    label: 'Temperatura horno (carta control)',
    iconClass: 'ri-temp-hot-line',
    docRef: 'RF-06 · UI-02 · Excel 6',
    excelEspecificacionesHint:
      '§6 · MACHOTE; hojas por mes; equipo, clave, días; ENTRY_OVEN_TEMP; RF-10, UI-02.',
    analisisResultadosHint: '§2.2 · fila 2 · integrar alertas “Critical Oven” (§2.3).'
  },
  {
    slug: 'horno-secado',
    label: 'Registro horno de secado',
    iconClass: 'ri-fire-line',
    docRef: 'Excel 11-M-HS',
    excelEspecificacionesHint: '§11 · M-HS-01; FOLIO 1…200; reagent_id, entry/exit time, meets_temp; ENTRY_DRYING_OVEN.',
    analisisResultadosHint: '§2.2 · fila 3.'
  },
  {
    slug: 'gastos-cartas',
    label: 'Gastos / cartas CE · pH',
    iconClass: 'ri-line-chart-line',
    docRef: 'RF-04 · RF-10 · Excel 4 y 5',
    excelEspecificacionesHint:
      '§4-5 · BD ENAYO, INF, SUP, VALOR, ALEATORIO; cartas CE y pH; ENTRY_EXPENSE_CHART + rangos.',
    analisisResultadosHint: '§2.2 · fila 4 · Shewhart / export gráficas (RF-10).'
  },
  {
    slug: 'lavado-material',
    label: 'Lavado de material',
    iconClass: 'ri-brush-line',
    docRef: 'RF-09 · Excel 12-M-LM',
    excelEspecificacionesHint:
      '§12 · M-LM-01; BD ~28 cols: FECHA, piezas, G:/F:, GARRAFAS, FRASCOS; ENTRY_MATERIAL_WASH.',
    analisisResultadosHint: '§2.2 · fila 5.'
  },
  {
    slug: 'preparacion-soluciones',
    label: 'Preparación de soluciones',
    iconClass: 'ri-flask-line',
    docRef: 'RF-07 · Excel 14-M-SOL',
    excelEspecificacionesHint:
      '§14 · M-SOL-01 hojas por fecha; M-SOL-02 BD SOLUCION, CONCENTRACION, CANTIDAD, CLAVE; ENTRY_SOLUTION_PREP + SOLUTION.',
    analisisResultadosHint: '§2.2 · fila 6 · vínculo con SOLUTION y Batch.'
  },
  {
    slug: 'pesadas',
    label: 'Pesadas',
    iconClass: 'ri-scales-3-line',
    docRef: 'ENTRY_WEIGHING · preparación soluciones',
    excelEspecificacionesHint: '§14 · Columnas de pesadas en M-SOL-02 BD; ENTRY_WEIGHING asociado a preparación.',
    analisisResultadosHint: '§2.2 · fila 6 (junto a preparación soluciones).'
  },
  {
    slug: 'precision',
    label: 'Precisión',
    iconClass: 'ri-focus-3-line',
    docRef: 'ENTRY_ACCURACY · priorización según MER',
    excelEspecificacionesHint: 'MER y Excel según existan; columnas → DTO según EXCEL_ESPECIFICACIONES cuando se documente.',
    analisisResultadosHint: '§2.2 · fila 7 · EntryAccuracy cuando se priorice.'
  },
  {
    slug: 'tratamiento-matraz',
    label: 'Tratamiento de matraz',
    iconClass: 'ri-test-tube-line',
    docRef: 'ENTRY_FLASK_TREATMENT',
    excelEspecificacionesHint: 'MER/Excel según existan; mismo criterio de mapeo columna → campo.',
    analisisResultadosHint: '§2.2 · fila 7 · EntryFlaskTreatment.'
  }
]

export const ENTRADA_MODULOS: EntradaModulo[] = RAW_ENTRADA_MODULOS.map(m => {
  const backend = ENTRADA_BACKEND_BY_SLUG[m.slug]

  if (!backend) {
    throw new Error(`Falta ENTRADA_BACKEND_BY_SLUG para slug: ${m.slug}`)
  }

  return { ...m, backend }
})

export const ENTRADA_SLUGS = ENTRADA_MODULOS.map(m => m.slug)

export function getEntradaModulo(slug: string): EntradaModulo | undefined {
  return ENTRADA_MODULOS.find(m => m.slug === slug)
}
```

---

## `src/components/ccasa/LogbooksPanel.tsx` (panel de bitácoras)

```tsx
'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import type { LogbookDTO } from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

type LogbooksPanelProps = {
  title?: string
  showCard?: boolean
}

const LogbooksPanel = ({ title = 'Bitácoras activas', showCard = true }: LogbooksPanelProps) => {
  const { token } = useAuth()
  const [rows, setRows] = useState<LogbookDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await apiFetch<LogbookDTO[]>('/api/v1/logbooks')

        if (!cancelled) setRows(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar bitácoras')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [token])

  const inner = (
    <>
      {loading ? (
        <Box className='flex justify-center p-6'>
          <CircularProgress />
        </Box>
      ) : null}
      {error ? (
        <Alert severity='error' className='m-4'>
          {error}
        </Alert>
      ) : null}
      {!loading && !error && rows ? (
        <>
          <Typography variant='body2' color='text.secondary' className='mbe-4'>
            Datos desde <code>GET /api/v1/logbooks</code> ({rows.length} registros).
          </Typography>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align='right'>Máx. entradas</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align='right'>{row.maxEntries}</TableCell>
                    <TableCell align='right'>
                      <Button component={Link} href={`/bitacoras/${row.id}`} size='small' variant='outlined'>
                        Ver entradas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </>
  )

  if (!showCard) {
    return inner
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>{inner}</CardContent>
    </Card>
  )
}

export default LogbooksPanel
```

---

## `src/app/(dashboard)/entradas/[slug]/EntradaTipoClient.tsx`

```tsx
'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import CrudListPanel from '@components/ccasa/CrudListPanel'

// Config Imports
import type { BackendExtraEndpoint } from '@configs/backendApiRegistry'
import { getEntradaModulo } from '@configs/ccasaModules'

function extrasLines(extras: BackendExtraEndpoint[] | undefined): string[] {
  if (!extras?.length) return []

  return extras.map(e => `${e.method} ${e.path} — ${e.label}`)
}

type EntradaTipoClientProps = {
  slug: string
}

const EntradaTipoClient = ({ slug }: EntradaTipoClientProps) => {
  const mod = getEntradaModulo(slug)

  if (!mod) {
    return null
  }

  const extraLines = extrasLines(mod.backend.extraEndpoints)

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>{mod.label}</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Volver al inicio
        </Button>
      </div>

      <CrudListPanel
        title={`Listado — ${mod.backend.controllerCrud}`}
        subtitle={`CRUD genérico (CrudResponseDTO). ${mod.docRef}`}
        apiPath={mod.backend.crudBasePath}
      />

      {extraLines.length > 0 ? (
        <Card variant='outlined'>
          <CardHeader title='Endpoints adicionales' titleTypographyProps={{ variant: 'subtitle1' }} />
          <CardContent>
            <Typography variant='body2' color='text.secondary' component='div'>
              <ul className='pli-4 m-0'>
                {extraLines.map(line => (
                  <li key={line} className='mbe-1'>
                    <code className='text-xs'>{line}</code>
                  </li>
                ))}
              </ul>
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <Card variant='outlined'>
        <CardHeader title='Trazabilidad documental' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Typography variant='body2' color='text.secondary' className='mbe-2'>
            <strong>Excel / especificaciones:</strong> {mod.excelEspecificacionesHint}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            <strong>Análisis resultados → software:</strong> {mod.analisisResultadosHint}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default EntradaTipoClient
```

---

## `src/contexts/AuthContext.tsx`

```tsx
'use client'

// React Imports
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// Lib Imports
import { apiFetch, getStoredAccessToken, setStoredAccessToken } from '@/lib/ccasa/api'
import type { AuthResponseDTO } from '@/lib/ccasa/types'

const STORAGE_EMAIL_KEY = 'ccasa_user_email'
const STORAGE_ROLE_KEY = 'ccasa_user_role'
const STORAGE_USER_ID_KEY = 'ccasa_user_id'

function readStoredProfile(): { email: string | null; role: string | null; userId: number | null } {
  if (typeof window === 'undefined') {
    return { email: null, role: null, userId: null }
  }

  const rawId = window.localStorage.getItem(STORAGE_USER_ID_KEY)
  const parsedId = rawId != null && rawId !== '' ? Number(rawId) : NaN

  return {
    email: window.localStorage.getItem(STORAGE_EMAIL_KEY),
    role: window.localStorage.getItem(STORAGE_ROLE_KEY),
    userId: Number.isFinite(parsedId) ? parsedId : null
  }
}

function writeStoredProfile(email: string | null, role: string | null, userId: number | null): void {
  if (typeof window === 'undefined') return

  if (email) {
    window.localStorage.setItem(STORAGE_EMAIL_KEY, email)
  } else {
    window.localStorage.removeItem(STORAGE_EMAIL_KEY)
  }

  if (role) {
    window.localStorage.setItem(STORAGE_ROLE_KEY, role)
  } else {
    window.localStorage.removeItem(STORAGE_ROLE_KEY)
  }

  if (userId != null && !Number.isNaN(userId)) {
    window.localStorage.setItem(STORAGE_USER_ID_KEY, String(userId))
  } else {
    window.localStorage.removeItem(STORAGE_USER_ID_KEY)
  }
}

type AuthContextValue = {
  token: string | null
  userId: number | null
  email: string | null
  role: string | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = getStoredAccessToken()

    if (stored) {
      setToken(stored)
      const profile = readStoredProfile()

      setEmail(profile.email)
      setRole(profile.role)
      setUserId(profile.userId)
    }

    setHydrated(true)
  }, [])

  const login = useCallback(async (loginEmail: string, password: string) => {
    const res = await apiFetch<AuthResponseDTO>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail.trim(), password }),
      skipAuth: true
    })

    setStoredAccessToken(res.token)
    setToken(res.token)
    setUserId(res.userId)
    setEmail(res.email)
    setRole(res.role)
    writeStoredProfile(res.email, res.role, res.userId)
  }, [])

  const logout = useCallback(() => {
    setStoredAccessToken(null)
    setToken(null)
    setUserId(null)
    setEmail(null)
    setRole(null)
    writeStoredProfile(null, null, null)
  }, [])

  const value = useMemo(
    () => ({ token, userId, email, role, hydrated, login, logout }),
    [token, userId, email, role, hydrated, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return ctx
}
```

---

## `src/components/layout/vertical/VerticalMenu.tsx` (menú lateral / rutas)

```tsx
// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Config Imports
import { ENTRADA_MODULOS } from '@configs/ccasaModules'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuSection label='Principal'>
          <MenuItem href='/' icon={<i className='ri-home-smile-line' />}>
            Inicio
          </MenuItem>
          <MenuItem href='/bitacoras' icon={<i className='ri-book-2-line' />}>
            Bitácoras
          </MenuItem>
          <MenuItem href='/folios' icon={<i className='ri-numbers-line' />}>
            Folios y bloques
          </MenuItem>
        </MenuSection>

        <MenuSection label='Registros por tipo'>
          <SubMenu label='Entradas' icon={<i className='ri-file-list-3-line' />}>
            <MenuItem href='/entradas/core' icon={<i className='ri-table-line' />}>
              Núcleo (tabla Entry)
            </MenuItem>
            {ENTRADA_MODULOS.map(mod => (
              <MenuItem key={mod.slug} href={`/entradas/${mod.slug}`} icon={<i className={mod.iconClass} />}>
                {mod.label}
              </MenuItem>
            ))}
          </SubMenu>
        </MenuSection>

        <MenuSection label='Datos maestros'>
          <SubMenu label='Catálogos' icon={<i className='ri-database-2-line' />}>
            <MenuItem href='/catalogos/reactivos' icon={<i className='ri-flask-line' />}>
              Reactivos
            </MenuItem>
            <MenuItem href='/catalogos/frascos-reactivo' icon={<i className='ri-inbox-line' />}>
              Frascos de reactivo
            </MenuItem>
            <MenuItem href='/catalogos/lotes' icon={<i className='ri-stack-line' />}>
              Lotes (batch)
            </MenuItem>
            <MenuItem href='/catalogos/soluciones' icon={<i className='ri-test-tube-line' />}>
              Soluciones
            </MenuItem>
            <MenuItem href='/catalogos/insumos' icon={<i className='ri-shopping-basket-line' />}>
              Insumos
            </MenuItem>
            <MenuItem href='/catalogos/equipos' icon={<i className='ri-tools-line' />}>
              Equipos
            </MenuItem>
          </SubMenu>
        </MenuSection>

        <MenuSection label='Operación'>
          <MenuItem href='/alertas' icon={<i className='ri-alarm-warning-line' />}>
            Alertas
          </MenuItem>
          <MenuItem href='/firmas' icon={<i className='ri-ball-pen-line' />}>
            Firmas y flujo
          </MenuItem>
        </MenuSection>

        <MenuSection label='Administración'>
          <MenuItem href='/empleados' icon={<i className='ri-team-line' />}>
            Empleados
          </MenuItem>
          <MenuItem href='/roles' icon={<i className='ri-shield-user-line' />}>
            Roles
          </MenuItem>
          <MenuItem href='/configuracion' icon={<i className='ri-settings-3-line' />}>
            Configuración del laboratorio
          </MenuItem>
          <MenuItem href='/account-settings' icon={<i className='ri-user-settings-line' />}>
            Mi cuenta
          </MenuItem>
        </MenuSection>

        <MenuSection label='Documentación (repo)'>
          <MenuItem href='/documentacion/excel-especificaciones' icon={<i className='ri-file-excel-2-line' />}>
            EXCEL_ESPECIFICACIONES
          </MenuItem>
          <MenuItem href='/documentacion/analisis-resultados-a-software' icon={<i className='ri-git-repository-line' />}>
            Análisis → software
          </MenuItem>
        </MenuSection>

        <MenuSection label='Plataforma'>
          <MenuItem href='/plataforma/tenants' icon={<i className='ri-building-4-line' />}>
            Laboratorios (Super Admin)
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
```

---

## `src/lib/ccasa/types.ts` (DTOs / tipos compartidos)

```typescript
/** Alineado con AuthResponseDTO del backend (POST /api/v1/auth/login|register|init-admin) */
export type AuthResponseDTO = {
  token: string
  userId: number
  email: string
  role: string
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
```

---

## `src/lib/ccasa/crudDisplay.ts` (columnas y celdas CRUD)

```typescript
import type { CrudResponseDTO } from '@/lib/ccasa/types'

const MAX_COLUMNS = 14

export function collectCrudColumns(rows: CrudResponseDTO[]): string[] {
  const keys = new Set<string>()

  for (const row of rows) {
    if (row.values && typeof row.values === 'object') {
      Object.keys(row.values).forEach(k => keys.add(k))
    }
  }

  return ['id', ...Array.from(keys).sort().slice(0, MAX_COLUMNS)]
}

export function formatCrudCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
```
