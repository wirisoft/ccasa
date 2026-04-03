// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

const Layout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      {/* Fondo blanco: evita que body (#FAFBFC por CssBaseline) se vea en login/register */}
      <div style={{ minHeight: '100dvh', backgroundColor: '#FFFFFF' }}>
        <BlankLayout>{children}</BlankLayout>
      </div>
    </Providers>
  )
}

export default Layout
