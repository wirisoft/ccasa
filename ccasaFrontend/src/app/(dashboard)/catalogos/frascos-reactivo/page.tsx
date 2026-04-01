import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { getCatalogBackend } from '@configs/backendApiRegistry'

const Page = () => {
  const c = getCatalogBackend('reagent-jars')!

  return (
    <ModulePlaceholder
      title='Frascos de reactivo'
      description='Gestión de frascos asociados a reactivos (ReagentJar).'
      docRef='Catálogos · ReagentJar'
      apiResources={[{ title: c.label, crudPath: c.crudBasePath, controller: c.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
