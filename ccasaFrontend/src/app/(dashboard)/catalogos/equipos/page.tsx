import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { getCatalogBackend } from '@configs/backendApiRegistry'

const Page = () => {
  const c = getCatalogBackend('equipment')!

  return (
    <ModulePlaceholder
      title='Equipos'
      description='Catálogo previsto a partir de Listados.xlsx (hoja EQUIPOS). Aún no expuesto en la API; cuando exista entidad/controller, usar el mismo patrón CRUD bajo /api/v1/…'
      docRef='EXCEL_ESPECIFICACIONES.md · Listados.xlsx'
      apiResources={[
        {
          title: c.label,
          notImplemented: true,
          footnote:
            'No hay EquipmentCrudController en ccasaBackend; la documentación de dominio sigue en EXCEL_ESPECIFICACIONES.'
        }
      ]}
      documentationHints={{
        excelEspecificaciones: '§ Listados.xlsx — EQUIPOS, DENOMINACION.',
        analisisResultados: '§1.1 — listados alimentan catálogos y desplegables cuando se implementen.'
      }}
      backHref='/'
    />
  )
}

export default Page
