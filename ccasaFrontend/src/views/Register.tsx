'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import Fade from '@mui/material/Fade'

import Logo from '@components/layout/shared/Logo'
import LabAnimation from '@components/ccasa/LabAnimation'
import LoadingScreen from '@components/ccasa/LoadingScreen'
import { useAuth } from '@/contexts/AuthContext'
import { safeInternalPath } from '@/lib/ccasa/safeInternalPath'

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

const Register = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const afterAuthPath = safeInternalPath(searchParams.get('next'))
  const { register } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showLoading, setShowLoading] = useState(false)
  const [fadeOutLoading, setFadeOutLoading] = useState(false)

  useEffect(() => {
    if (!showLoading) {
      return
    }

    const timer = setTimeout(() => {
      setFadeOutLoading(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [showLoading])

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const fieldError = (field: string, value: string, extraCheck?: string | null): string | null => {
    if (!touched[field]) {
      return null
    }

    if (value.trim() === '') {
      return 'Este campo es obligatorio'
    }

    return extraCheck ?? null
  }

  const emailExtraError = email.trim() !== '' && !validateEmail(email.trim())
    ? 'Ingresa un correo válido'
    : null

  const passwordExtraError = password !== '' && password.length < 6
    ? 'Mínimo 6 caracteres'
    : null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched({ firstName: true, lastName: true, email: true, password: true })

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password) {
      setError('Completa todos los campos para continuar.')

      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Ingresa un correo electrónico válido.')

      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')

      return
    }

    if (!agreeToTerms) {
      setError('Debes aceptar los términos y condiciones.')

      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await register(trimmedFirst, trimmedLast, trimmedEmail, password)
      setShowLoading(true)
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      const lower = raw.toLowerCase()

      if (
        lower.includes('token') ||
        lower.includes('unauthorized') ||
        lower.includes('duplicate') ||
        lower.includes('already')
      ) {
        setError('Este correo electrónico ya está registrado. Intenta con otro o inicia sesión.')
      } else {
        setError(raw || 'No se pudo crear la cuenta. Intenta de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (showLoading) {
    return (
      <LoadingScreen
        fadeOut={fadeOutLoading}
        onFadeOutComplete={() => router.replace(afterAuthPath)}
      />
    )
  }

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
      {/* Panel izquierdo */}
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
              Únete a Bitácoras Servicios Ambientales
            </Typography>

            <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.8 }}>
              Crea tu cuenta para acceder al sistema de gestión de bitácoras del laboratorio.
            </Typography>

            <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { icon: 'ri-check-double-line', text: 'Registro rápido y seguro' },
                { icon: 'ri-lock-line', text: 'Datos protegidos con JWT' },
                { icon: 'ri-team-line', text: 'Colaboración en tiempo real' }
              ].map(item => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: 16, color: '#FFFFFF' }} />
                  </Box>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>

        <LabAnimation />
      </Box>

      {/* Panel derecho */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          px: { xs: 3, sm: 6 },
          py: 4,
          overflowY: 'auto'
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
              <Logo />
            </Box>

            <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>
              Crear cuenta
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
              Completa tus datos para registrarte en el sistema
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TextField
                    autoFocus
                    fullWidth
                    label='Nombre'
                    name='firstName'
                    autoComplete='given-name'
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    onBlur={() => markTouched('firstName')}
                    disabled={submitting}
                    error={fieldError('firstName', firstName) != null}
                    helperText={fieldError('firstName', firstName)}
                    sx={textFieldFocusSx}
                  />
                  <TextField
                    fullWidth
                    label='Apellido'
                    name='lastName'
                    autoComplete='family-name'
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    onBlur={() => markTouched('lastName')}
                    disabled={submitting}
                    error={fieldError('lastName', lastName) != null}
                    helperText={fieldError('lastName', lastName)}
                    sx={textFieldFocusSx}
                  />
                </Box>

                <TextField
                  fullWidth
                  label='Correo electrónico'
                  name='email'
                  type='email'
                  autoComplete='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => markTouched('email')}
                  disabled={submitting}
                  error={fieldError('email', email, emailExtraError) != null}
                  helperText={fieldError('email', email, emailExtraError)}
                  sx={textFieldFocusSx}
                />

                <TextField
                  fullWidth
                  label='Contraseña'
                  name='password'
                  type={isPasswordShown ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => markTouched('password')}
                  disabled={submitting}
                  error={fieldError('password', password, passwordExtraError) != null}
                  helperText={fieldError('password', password, passwordExtraError) ?? 'Mínimo 6 caracteres'}
                  sx={textFieldFocusSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setIsPasswordShown(s => !s)}
                          onMouseDown={e => e.preventDefault()}
                          aria-label={isPasswordShown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeToTerms}
                      onChange={e => setAgreeToTerms(e.target.checked)}
                      disabled={submitting}
                      sx={{ '&.Mui-checked': { color: '#1565C0' } }}
                    />
                  }
                  label={
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      Acepto los términos y condiciones
                    </Typography>
                  }
                />

                <Button
                  fullWidth
                  variant='contained'
                  type='submit'
                  disabled={submitting || !agreeToTerms}
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
                  {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
                </Button>
              </Box>
            </form>

            <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
              ¿Ya tienes cuenta?{' '}
              <Typography
                component={Link}
                href='/login'
                variant='body2'
                sx={{
                  color: '#1565C0',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Inicia sesión
              </Typography>
            </Typography>

            <Typography
              variant='caption'
              sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.disabled' }}
            >
              © {new Date().getFullYear()} Bitácoras Servicios Ambientales
            </Typography>
          </Box>
        </Fade>
      </Box>
    </Box>
  )
}

export default Register
