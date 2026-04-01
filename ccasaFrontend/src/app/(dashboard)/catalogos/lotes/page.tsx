import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { getCatalogBackend } from '@configs/backendApiRegistry'

const Page = () => {
  const c = getCatalogBackend('batches')!

  return (
    <ModulePlaceholder
      title='Lotes (batch)'
      description='Lotes vinculados a agua destilada, gastos y trazabilidad según MER y Excel.'
      docRef='Catálogos · Batch'
      apiResources={[{ title: c.label, crudPath: c.crudBasePath, controller: c.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
