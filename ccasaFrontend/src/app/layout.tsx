// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Next Imports
import type { Metadata, Viewport } from 'next'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Component Imports
import AuthRootProvider from '@components/ccasa/AuthRootProvider'
import ServiceWorkerRegistrar from '@components/ccasa/ServiceWorkerRegistrar'

export const metadata: Metadata = {
  title: 'Bitácoras Servicios Ambientales',
  description: 'Sistema de gestión digital de bitácoras de laboratorio.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bitácoras Servicios Ambientales'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo.png', type: 'image/png', sizes: '192x192' }
    ],
    apple: [{ url: '/logo.png', type: 'image/png', sizes: '180x180' }],
    shortcut: ['/logo.png']
  }
}

export const viewport: Viewport = {
  themeColor: '#1565C0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
}

const RootLayout = ({ children }: ChildrenType) => {
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <AuthRootProvider>
          {children}
          <ServiceWorkerRegistrar />
        </AuthRootProvider>
      </body>
    </html>
  )
}

export default RootLayout
