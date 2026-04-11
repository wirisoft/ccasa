'use client'

import { useEffect } from 'react'

const ServiceWorkerRegistrar = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      return
    }

    const register = () => {
      void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
        void reg.update()
      })
    }

    register()

    const onFocus = () => {
      void navigator.serviceWorker.getRegistration().then(reg => reg?.update())
    }

    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return null
}

export default ServiceWorkerRegistrar
