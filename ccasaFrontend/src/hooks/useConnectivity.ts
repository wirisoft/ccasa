/**
 * Tracks browser online/offline state and transition history.
 * Listens to window 'online' and 'offline' events and cleans up on unmount.
 *
 * @module useConnectivity
 * @dependencies react, @/lib/logger
 * @example
 *   const { isOnline, wasOffline, connectionChangedAt } = useConnectivity()
 */

'use client'

import { useEffect, useState } from 'react'

import { createLogger } from '@/lib/logger'

const log = createLogger('useConnectivity')

interface ConnectivityState {
  /** Current online/offline status */
  isOnline: boolean
  /** Becomes true once the user goes offline; stays true for the session */
  wasOffline: boolean
  /** Timestamp of the last online ↔ offline transition */
  connectionChangedAt: Date | null
}

/**
 * Returns real-time browser connectivity state.
 * Initialises from navigator.onLine to avoid SSR mismatch.
 */
export function useConnectivity(): ConnectivityState {
  const [state, setState] = useState<ConnectivityState>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    connectionChangedAt: null,
  }))

  useEffect(() => {
    const handleOnline = () => {
      log.info('Red conectada')
      setState(prev => ({
        isOnline: true,
        wasOffline: prev.wasOffline,
        connectionChangedAt: new Date(),
      }))
    }

    const handleOffline = () => {
      log.warn('Red desconectada')
      setState(prev => ({
        isOnline: false,
        wasOffline: true,
        connectionChangedAt: new Date(),
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return state
}
