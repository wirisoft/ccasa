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

/** Auth: permitAll en SecurityConfiguration para login/register/forgot-password; buscar implementación en el paquete security/auth si aplica */
export const AUTH_BACKEND_PLANNED: BackendExtraEndpoint[] = [
  { method: 'POST', path: `${API_V1}/auth/login`, label: 'permitAll — JWT' },
  { method: 'POST', path: `${API_V1}/auth/register`, label: 'permitAll' },
  { method: 'POST', path: `${API_V1}/auth/forgot-password`, label: 'permitAll' }
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
