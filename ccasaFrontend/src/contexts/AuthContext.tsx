'use client'

// React Imports
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// Lib Imports
import { apiFetch, getStoredAccessToken, setStoredAccessToken } from '@/lib/ccasa/api'
import type { AuthResponseDTO } from '@/lib/ccasa/types'

const STORAGE_EMAIL_KEY = 'ccasa_user_email'
const STORAGE_ROLE_KEY = 'ccasa_user_role'
const STORAGE_USER_ID_KEY = 'ccasa_user_id'

function readStoredProfile(): { email: string | null; role: string | null; userId: number | null } {
  if (typeof window === 'undefined') {
    return { email: null, role: null, userId: null }
  }

  const rawId = window.localStorage.getItem(STORAGE_USER_ID_KEY)
  const parsedId = rawId != null && rawId !== '' ? Number(rawId) : NaN

  return {
    email: window.localStorage.getItem(STORAGE_EMAIL_KEY),
    role: window.localStorage.getItem(STORAGE_ROLE_KEY),
    userId: Number.isFinite(parsedId) ? parsedId : null
  }
}

function writeStoredProfile(email: string | null, role: string | null, userId: number | null): void {
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

  if (userId != null && !Number.isNaN(userId)) {
    window.localStorage.setItem(STORAGE_USER_ID_KEY, String(userId))
  } else {
    window.localStorage.removeItem(STORAGE_USER_ID_KEY)
  }
}

type AuthContextValue = {
  token: string | null
  userId: number | null
  email: string | null
  role: string | null
  hydrated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
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
      setUserId(profile.userId)
    }

    setHydrated(true)
  }, [])

  const login = useCallback(async (loginEmail: string, password: string) => {
    const res = await apiFetch<AuthResponseDTO>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail.trim(), password }),
      skipAuth: true
    })

    setStoredAccessToken(res.token)
    setToken(res.token)
    setUserId(res.userId)
    setEmail(res.email)
    setRole(res.role)
    writeStoredProfile(res.email, res.role, res.userId)
  }, [])

  const register = useCallback(async (firstName: string, lastName: string, email: string, password: string) => {
    const res = await apiFetch<AuthResponseDTO>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email: email.trim(), password }),
      skipAuth: true
    })

    setStoredAccessToken(res.token)
    setToken(res.token)
    setUserId(res.userId)
    setEmail(res.email)
    setRole(res.role)
    writeStoredProfile(res.email, res.role, res.userId)
  }, [])

  const logout = useCallback(() => {
    setStoredAccessToken(null)
    setToken(null)
    setUserId(null)
    setEmail(null)
    setRole(null)
    writeStoredProfile(null, null, null)
  }, [])

  const value = useMemo(
    () => ({ token, userId, email, role, hydrated, login, register, logout }),
    [token, userId, email, role, hydrated, login, register, logout]
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
