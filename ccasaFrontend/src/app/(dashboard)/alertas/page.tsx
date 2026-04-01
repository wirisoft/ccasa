import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { SUPPORT_BACKEND } from '@configs/backendApiRegistry'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'alerts')!

  return (
    <ModulePlaceholder
      title='Alertas'
      description='Listado y CRUD de alertas; reglas automáticas (p. ej. horno fuera de rango → UI-02) en capa de servicio.'
      docRef='Módulo alertas · UI-02'
      apiResources={[{ title: s.label, crudPath: s.crudBasePath, controller: s.controllerHint }]}
      backHref='/'
    />
  )
}

export default Page
