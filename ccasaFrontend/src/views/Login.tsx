'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const Login = ({ mode, redirectTo = '/' }: { mode: Mode; redirectTo?: string }) => {
  const [email, setEmail] = useState('admin@ccasa.local')
  const [password, setPassword] = useState('change-me')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { login, token, hydrated } = useAuth()

  useEffect(() => {
    if (!hydrated) return

    if (token) {
      router.replace(redirectTo)
    }
  }, [hydrated, token, router, redirectTo])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      router.replace(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/login' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`ccasa — ${themeConfig.templateName}`}</Typography>
              <Typography className='mbs-1' color='text.secondary'>
                Inicia sesión con el usuario del DataLoader del backend (por defecto admin@ccasa.local / change-me).
              </Typography>
            </div>
            {error ? (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            ) : null}
            <form noValidate autoComplete='on' onSubmit={e => void handleSubmit(e)} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Correo'
                name='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label='Contraseña'
                name='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsPasswordShown(s => !s)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button fullWidth variant='contained' type='submit' disabled={submitting}>
                {submitting ? 'Entrando…' : 'Entrar'}
              </Button>
              <Typography variant='body2' color='text.secondary' className='text-center'>
                ¿Sin sesión? El panel requiere backend en marcha y JWT (carpeta{' '}
                <code className='text-xs'>jwtKeys/*.pem</code> generada localmente; ver README del backend).
              </Typography>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Login
