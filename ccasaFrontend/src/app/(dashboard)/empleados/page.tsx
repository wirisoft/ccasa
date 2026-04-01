import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { SUPPORT_BACKEND } from '@configs/backendApiRegistry'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'users')!

  return (
    <ModulePlaceholder
      title='Empleados'
      description='CRUD de usuarios (User). El JWT incluye tenantId y roles (CcasaUserDetails); la autorización por rol está en SecurityConfiguration.'
      docRef='Core · User · RF-01'
      apiResources={[{ title: s.label, crudPath: s.crudBasePath, controller: s.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
