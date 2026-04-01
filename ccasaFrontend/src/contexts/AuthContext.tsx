'use client'

// React Imports
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// Lib Imports
import { apiFetch, getStoredAccessToken, setStoredAccessToken } from '@/lib/ccasa/api'
import type { LoginResponseDTO } from '@/lib/ccasa/types'

const STORAGE_EMAIL_KEY = 'ccasa_user_email'
const STORAGE_ROLE_KEY = 'ccasa_user_role'

function readStoredProfile(): { email: string | null; role: string | null } {
  if (typeof window === 'undefined') {
    return { email: null, role: null }
  }

  return {
    email: window.localStorage.getItem(STORAGE_EMAIL_KEY),
    role: window.localStorage.getItem(STORAGE_ROLE_KEY)
  }
}

function writeStoredProfile(email: string | null, role: string | null): void {
  if (typeof window === 'undefined') return

  if (email) {
    window.localStorage.setItem(STORAGE_EMAIL_KEY, email)
  } else {
    window.localStorage.removeItem(STORAGE_EMAIL_KEY)
  }

  if (role) {
    window.localStorage.setItem(STORAGE_ROLE_KEY, role)
  } else {
    window.localStorage.removeItem(STORAGE_ROLE_KEY)
  }
}

type AuthContextValue = {
  token: string | null
  email: string | null
  role: string | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = getStoredAccessToken()

    if (stored) {
      setToken(stored)
      const profile = readStoredProfile()

      setEmail(profile.email)
      setRole(profile.role)
    }

    setHydrated(true)
  }, [])

  const login = useCallback(async (loginEmail: string, password: string) => {
    const res = await apiFetch<LoginResponseDTO>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail.trim(), password }),
      skipAuth: true
    })

    setStoredAccessToken(res.accessToken)
    setToken(res.accessToken)
    setEmail(res.email)
    setRole(res.role)
    writeStoredProfile(res.email, res.role)
  }, [])

  const logout = useCallback(() => {
    setStoredAccessToken(null)
    setToken(null)
    setEmail(null)
    setRole(null)
    writeStoredProfile(null, null)
  }, [])

  const value = useMemo(
    () => ({ token, email, role, hydrated, login, logout }),
    [token, email, role, hydrated, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return ctx
}
