# Frontend ccasa: registro, layout en blanco, AuthContext y tipos

Documento generado a partir del estado del repositorio. Rutas relativas al proyecto `ccasaFrontend/`.

---

## Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué ruta carga el registro? | **`/register`** (el grupo `(blank-layout-pages)` no aparece en la URL). |
| ¿Formulario real o placeholder? | **UI completa** (MUI: card, campos, checkbox, botones). **Sin lógica**: `onSubmit` hace `preventDefault`, sin estado en campos ni llamada a API; no usa `AuthContext`. |

---

## `src/views/Register.tsx`

```tsx
'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
            <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
              <TextField autoFocus fullWidth label='Username' />
              <TextField fullWidth label='Email' />
              <TextField
                fullWidth
                label='Password'
                type={isPasswordShown ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
              <Button fullWidth variant='contained' type='submit'>
                Sign Up
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Sign in instead
                </Typography>
              </div>
              <Divider className='gap-3'>Or</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
```

---

## Layout sin sidebar (blank)

### `src/app/(blank-layout-pages)/layout.tsx`

```tsx
// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

const Layout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <BlankLayout>{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
```

**Estructura:** el segmento `(blank-layout-pages)` es un *route group* de Next.js: no cambia la URL. Este layout envuelve las páginas hijas con `Providers` y `BlankLayout` (pantalla completa, sin menú lateral).

### `src/@layouts/BlankLayout.tsx`

```tsx
'use client'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { blankLayoutClasses } from './utils/layoutClasses'

const BlankLayout = ({ children }: ChildrenType) => {
  return <div className={classnames(blankLayoutClasses.root, 'is-full bs-full')}>{children}</div>
}

export default BlankLayout
```

---

## Página Next que monta el registro

### `src/app/(blank-layout-pages)/register/page.tsx`

```tsx
// Component Imports
import Register from '@views/Register'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const RegisterPage = () => {
  // Vars
  const mode = getServerMode()

  return <Register mode={mode} />
}

export default RegisterPage
```

---

## `src/contexts/AuthContext.tsx`

```tsx
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

  const logout = useCallback(() => {
    setStoredAccessToken(null)
    setToken(null)
    setUserId(null)
    setEmail(null)
    setRole(null)
    writeStoredProfile(null, null, null)
  }, [])

  const value = useMemo(
    () => ({ token, userId, email, role, hydrated, login, logout }),
    [token, userId, email, role, hydrated, login, logout]
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
```

---

## `src/lib/ccasa/types.ts`

```ts
/** Alineado con AuthResponseDTO del backend (POST /api/v1/auth/login|register|init-admin) */
export type AuthResponseDTO = {
  token: string
  userId: number
  email: string
  role: string
}

/** Alineado con LogbookDTO del backend (code/maxEntries son Integer en Java → number en JSON) */
export type LogbookDTO = {
  id: number
  code: number
  name: string
  description: string
  maxEntries: number
}

/** Alineado con CrudResponseDTO del backend (listados CRUD genéricos) */
export type CrudResponseDTO = {
  id: number
  values: Record<string, unknown>
}

/** Alineado con EntrySummaryDTO del backend */
export type EntrySummaryDTO = {
  id: number
  folioId: number
  folioNumber: number
  logbookId: number
  logbookCode: number
  logbookName: string
  userId: number
  entryStatus: string
  recordedAt: string
}
```
