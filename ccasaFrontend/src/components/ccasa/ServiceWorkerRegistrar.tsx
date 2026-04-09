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

    void navigator.serviceWorker.register('/sw.js')
  }, [])

  return null
}

export default ServiceWorkerRegistrar
