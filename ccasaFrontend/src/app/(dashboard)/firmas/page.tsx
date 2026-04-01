import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { SUPPORT_BACKEND } from '@configs/backendApiRegistry'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'signatures')!

  return (
    <ModulePlaceholder
      title='Firmas y flujo'
      description='CRUD de firmas; el flujo Draft → Signed → Locked y doble firma RF-02 se completa en servicios y pantallas que consuman Entry + Signature.'
      docRef='RF-02 · Signature'
      apiResources={[{ title: s.label, crudPath: s.crudBasePath, controller: s.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
