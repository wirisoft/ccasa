import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { getCatalogBackend } from '@configs/backendApiRegistry'

const Page = () => {
  const c = getCatalogBackend('supplies')!

  return (
    <ModulePlaceholder
      title='Insumos'
      description='Insumos y suministros (Supply) para inventario y cartas de gastos.'
      docRef='Catálogos · Supply · RF-04'
      apiResources={[{ title: c.label, crudPath: c.crudBasePath, controller: c.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
