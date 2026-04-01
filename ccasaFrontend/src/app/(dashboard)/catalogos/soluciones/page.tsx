import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { getCatalogBackend } from '@configs/backendApiRegistry'

const Page = () => {
  const c = getCatalogBackend('solutions')!

  return (
    <ModulePlaceholder
      title='Soluciones'
      description='Catálogo de soluciones (nombre, concentración, cantidad, clave) para preparación y pesadas.'
      docRef='Catálogos · Solution · RF-07'
      apiResources={[{ title: c.label, crudPath: c.crudBasePath, controller: c.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
