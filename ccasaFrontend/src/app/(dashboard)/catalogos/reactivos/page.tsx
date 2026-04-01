import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { getCatalogBackend } from '@configs/backendApiRegistry'

const Page = () => {
  const c = getCatalogBackend('reagents')!

  return (
    <ModulePlaceholder
      title='Catálogo de reactivos'
      description='CRUD vía AbstractCrudController; reactivos usados en horno de secado, soluciones y otros registros.'
      docRef='Catálogos · Reagent'
      apiResources={[
        {
          title: c.label,
          crudPath: c.crudBasePath,
          controller: c.controllerHint
        }
      ]}
      backHref='/'
    />
  )
}

export default Page
