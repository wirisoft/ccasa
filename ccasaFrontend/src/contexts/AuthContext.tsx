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
const STORAGE_FIRST_NAME_KEY = 'ccasa_user_firstName'
const STORAGE_LAST_NAME_KEY = 'ccasa_user_lastName'

function readStoredProfile(): {
  email: string | null
  role: string | null
  userId: number | null
  firstName: string | null
  lastName: string | null
} {
  if (typeof window === 'undefined') {
    return { email: null, role: null, userId: null, firstName: null, lastName: null }
  }

  const rawId = window.localStorage.getItem(STORAGE_USER_ID_KEY)
  const parsedId = rawId != null && rawId !== '' ? Number(rawId) : NaN

  return {
    email: window.localStorage.getItem(STORAGE_EMAIL_KEY),
    role: window.localStorage.getItem(STORAGE_ROLE_KEY),
    userId: Number.isFinite(parsedId) ? parsedId : null,
    firstName: window.localStorage.getItem(STORAGE_FIRST_NAME_KEY),
    lastName: window.localStorage.getItem(STORAGE_LAST_NAME_KEY)
  }
}

function writeStoredProfile(
  email: string | null,
  role: string | null,
  userId: number | null,
  firstName: string | null,
  lastName: string | null
): void {
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

  if (firstName) {
    window.localStorage.setItem(STORAGE_FIRST_NAME_KEY, firstName)
  } else {
    window.localStorage.removeItem(STORAGE_FIRST_NAME_KEY)
  }

  if (lastName) {
    window.localStorage.setItem(STORAGE_LAST_NAME_KEY, lastName)
  } else {
    window.localStorage.removeItem(STORAGE_LAST_NAME_KEY)
  }
}

type AuthContextValue = {
  token: string | null
  userId: number | null
  email: string | null
  role: string | null
  firstName: string | null
  lastName: string | null
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
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = getStoredAccessToken()

    if (stored) {
      setToken(stored)
      const profile = readStoredProfile()

      setEmail(profile.email)
      setRole(profile.role)
      setUserId(profile.userId)
      setFirstName(profile.firstName)
      setLastName(profile.lastName)
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
    setFirstName(res.firstName)
    setLastName(res.lastName)
    writeStoredProfile(res.email, res.role, res.userId, res.firstName, res.lastName)
  }, [])

  const register = useCallback(async (regFirstName: string, regLastName: string, regEmail: string, password: string) => {
    const res = await apiFetch<AuthResponseDTO>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail.trim(),
        password
      }),
      skipAuth: true
    })

    setStoredAccessToken(res.token)
    setToken(res.token)
    setUserId(res.userId)
    setEmail(res.email)
    setRole(res.role)
    setFirstName(res.firstName)
    setLastName(res.lastName)
    writeStoredProfile(res.email, res.role, res.userId, res.firstName, res.lastName)
  }, [])

  const logout = useCallback(() => {
    setStoredAccessToken(null)
    setToken(null)
    setUserId(null)
    setEmail(null)
    setRole(null)
    setFirstName(null)
    setLastName(null)
    writeStoredProfile(null, null, null, null, null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      userId,
      email,
      role,
      firstName,
      lastName,
      hydrated,
      login,
      register,
      logout
    }),
    [token, userId, email, role, firstName, lastName, hydrated, login, register, logout]
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
