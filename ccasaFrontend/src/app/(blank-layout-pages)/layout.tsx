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
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--mui-palette-background-default)' }}>
        <BlankLayout>{children}</BlankLayout>
      </div>
    </Providers>
  )
}

export default Layout
