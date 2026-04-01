import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { SUPPORT_BACKEND } from '@configs/backendApiRegistry'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'roles')!

  return (
    <ModulePlaceholder
      title='Roles'
      description='CRUD de roles (Role). Coherente con MER y permisos de endpoints.'
      docRef='Core · Role'
      apiResources={[{ title: s.label, crudPath: s.crudBasePath, controller: s.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
