import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { API_V1 } from '@configs/backendApiRegistry'

const Page = () => (
  <ModulePlaceholder
    title='Folios y bloques'
    description='Ciclo de folios RF-03: FolioBlock + Folio (rango típico 1–200 por bitácora), asignación al crear entrada y consulta del siguiente folio disponible. Transversal a todos los tipos de entrada (ver ANALISIS_RESULTADOS_A_SOFTWARE.md §2.3).'
    docRef='RF-03 · Folio · FolioBlock'
    apiResources={[
      {
        title: 'Folios',
        crudPath: `${API_V1}/folios`,
        controller: 'FolioCrudController'
      },
      {
        title: 'Bloques de folios',
        crudPath: `${API_V1}/folio-blocks`,
        controller: 'FolioBlockCrudController'
      }
    ]}
    documentationHints={{
      excelEspecificaciones:
        'Las plantillas Excel (p. ej. agua destilada, horno M-HS) usan columnas o hojas FOLIO; el número debe ser coherente con el estado del folio en el core.',
      analisisResultados:
        '§2.3 Ciclo de folios · §3.1 mismo patrón de servicios; endpoints /api/v1/folios y /api/v1/folio-blocks.'
    }}
    backHref='/'
  />
)

export default Page
