/**
 * Módulos de interfaz alineados con documentación + backendApiRegistry (API real).
 */

import type { EntradaBackendConfig } from './backendApiRegistry'
import { ENTRADA_BACKEND_BY_SLUG } from './backendApiRegistry'

export type EntradaModulo = {
  slug: string
  label: string

  /** Texto breve bajo el título de la página del módulo (opcional). */
  pageDescription?: string
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
    label: 'Conductividad KCl — RF-05 (alta y baja)',
    pageDescription:
      'Solución KCl: ingresa tipo y peso; el sistema calcula la conductividad (µS/cm), valida el rango y genera el folio BSA-COND.',
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
