import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { AUTH_BACKEND_PLANNED, PLATFORM_BACKEND_NOTE } from '@configs/backendApiRegistry'

const Page = () => (
  <ModulePlaceholder
    title='Laboratorios (Super Admin)'
    description={`Solo rol Super Admin: crear y administrar tenants y primer usuario (documentación PROPUESTA_SOFTWARE_MODULAR §3.0). ${PLATFORM_BACKEND_NOTE} Rutas auth referenciadas en SecurityConfiguration (implementación a verificar en el paquete de auth).`}
    docRef='Módulo Plataforma · §3.0'
    apiResources={[
      {
        title: 'Auth (referencia en seguridad)',
        extras: AUTH_BACKEND_PLANNED,
        footnote: 'permitAll para login/register/forgot-password; el resto de /api/v1 suele exigir JWT.'
      }
    ]}
    backHref='/'
  />
)

export default Page
