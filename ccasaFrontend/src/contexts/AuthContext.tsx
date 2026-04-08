'use client'

// React Imports
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import {
  clearCcasaClientSession,
  getStoredAccessToken,
  readStoredProfile,
  setStoredAccessToken,
  writeStoredProfile
} from '@/lib/ccasa/clientSession'
import type { AuthResponseDTO } from '@/lib/ccasa/types'

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
    try {
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar'
      const lower = msg.toLowerCase()

      if (
        lower.includes('token') ||
        lower.includes('unauthorized') ||
        lower.includes('acceso requerido')
      ) {
        throw new Error(
          'No se pudo completar el registro. Es posible que el correo ya esté en uso o haya un problema en el servidor.'
        )
      }

      throw new Error(msg)
    }
  }, [])

  const logout = useCallback(() => {
    clearCcasaClientSession()
    setToken(null)
    setUserId(null)
    setEmail(null)
    setRole(null)
    setFirstName(null)
    setLastName(null)
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
