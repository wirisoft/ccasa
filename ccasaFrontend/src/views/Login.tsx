'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Fade from '@mui/material/Fade'

import Logo from '@components/layout/shared/Logo'
import LabAnimation from '@components/ccasa/LabAnimation'
import { useAuth } from '@/contexts/AuthContext'

const textFieldFocusSx = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1565C0'
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#1565C0'
  }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false })

  const router = useRouter()
  const { login } = useAuth()

  const emailError = touched.email && email.trim() !== '' && !validateEmail(email.trim())
    ? 'Ingresa un correo electrónico válido'
    : touched.email && email.trim() === ''
      ? 'El correo es obligatorio'
      : null

  const passwordError = touched.password && password === ''
    ? 'La contraseña es obligatoria'
    : null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setError('Completa todos los campos para continuar.')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await login(trimmedEmail, password)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión. Verifica tus credenciales.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
      {/* Panel izquierdo - branding */}
      <Box
        sx={{
          width: { xs: 0, md: '45%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'stretch',
          background: 'linear-gradient(160deg, #0D2137 0%, #132F4C 50%, #1565C0 100%)',
          color: '#fff',
          px: 8,
          py: { md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 400, width: '100%' }}>
            <Box sx={{ mb: 5 }}>
              <Logo variant='light' />
            </Box>

            <Typography variant='h4' sx={{ color: '#FFFFFF', fontWeight: 800, mb: 2, lineHeight: 1.3 }}>
              Sistema de gestión de bitácoras
            </Typography>

            <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.8 }}>
              Administra bitácoras, entradas, catálogos y personal de tu laboratorio de forma centralizada y segura.
            </Typography>

            <Box sx={{ mt: 6, display: 'flex', gap: 4 }}>
              {[
                { icon: 'ri-book-2-line', label: 'Bitácoras digitales' },
                { icon: 'ri-flask-line', label: 'Control de reactivos' },
                { icon: 'ri-shield-check-line', label: 'Trazabilidad completa' }
              ].map(item => (
                <Box key={item.label} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      mx: 'auto'
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: 22, color: '#FFFFFF' }} />
                  </Box>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem' }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>

        <LabAnimation />
      </Box>

      {/* Panel derecho - formulario */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          px: { xs: 3, sm: 6 },
          py: 4
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            {/* Logo móvil */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
              <Logo />
            </Box>

            <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>
              Bienvenido de nuevo
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
              Ingresa tus credenciales para acceder al sistema
            </Typography>

            {error ? (
              <Fade in>
                <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Fade>
            ) : null}

            <form noValidate autoComplete='on' onSubmit={e => void handleSubmit(e)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label='Correo electrónico'
                  name='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  disabled={submitting}
                  error={emailError != null}
                  helperText={emailError}
                  sx={textFieldFocusSx}
                />

                <TextField
                  fullWidth
                  label='Contraseña'
                  name='password'
                  type={isPasswordShown ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  disabled={submitting}
                  error={passwordError != null}
                  helperText={passwordError}
                  sx={textFieldFocusSx}
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography
                    component={Link}
                    href='/forgot-password'
                    variant='body2'
                    sx={{
                      color: '#1565C0',
                      fontWeight: 500,
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant='contained'
                  type='submit'
                  disabled={submitting}
                  sx={{
                    height: 48,
                    backgroundColor: '#1565C0',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                    '&:hover': {
                      backgroundColor: '#0D47A1',
                      boxShadow: '0 6px 16px rgba(21, 101, 192, 0.4)'
                    }
                  }}
                >
                  {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
                </Button>
              </Box>
            </form>

            <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
              ¿No tienes cuenta?{' '}
              <Typography
                component={Link}
                href='/register'
                variant='body2'
                sx={{
                  color: '#1565C0',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Regístrate
              </Typography>
            </Typography>

            <Typography
              variant='caption'
              sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.disabled' }}
            >
              © {new Date().getFullYear()} CCASA Lab — Bitácoras de laboratorio
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default Login
