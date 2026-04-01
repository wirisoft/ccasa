'use client'

// React Imports
import type { ReactNode } from 'react'

// Context Imports
import { AuthProvider } from '@/contexts/AuthContext'

const AuthRootProvider = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>
}

export default AuthRootProvider
