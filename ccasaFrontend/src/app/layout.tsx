// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Component Imports
import AuthRootProvider from '@components/ccasa/AuthRootProvider'

export const metadata = {
  title: 'ccasa — Bitácoras de laboratorio',
  description: 'Sistema de gestión digital de bitácoras de laboratorio (ccasa).'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <AuthRootProvider>{children}</AuthRootProvider>
      </body>
    </html>
  )
}

export default RootLayout
