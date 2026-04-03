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
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'

import Logo from '@components/layout/shared/Logo'
import { useAuth } from '@/contexts/AuthContext'

const textFieldFocusSx = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1565C0'
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#1565C0'
  }
}

const Register = () => {
  const router = useRouter()
  const { register } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password || !agreeToTerms) {
      setError('Completa todos los campos y acepta los términos y condiciones.')

      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await register(trimmedFirst, trimmedLast, trimmedEmail, password)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex'
      }}
    >
      <Box
        sx={{
          width: { xs: 0, md: '45%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'stretch',
          backgroundColor: '#0D2137',
          color: '#fff',
          px: 8,
          py: { md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 400, width: '100%' }}>
          <Box sx={{ mb: 5 }}>
            <Logo variant='light' />
          </Box>
          <Typography variant='h4' sx={{ fontWeight: 800, mb: 2, lineHeight: 1.3 }}>
            Únete a CCASA Lab
          </Typography>
          <Typography variant='body1' sx={{ opacity: 0.85, lineHeight: 1.8 }}>
            Crea tu cuenta para acceder al sistema de gestión de bitácoras del laboratorio.
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)' }} />
      </Box>

      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          paddingLeft: 48,
          paddingRight: 48,
          paddingTop: 32,
          paddingBottom: 32
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto' }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
            <Logo />
          </Box>

          <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>
            Crear cuenta
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
            Completa tus datos para registrarte
          </Typography>

          {error ? (
            <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          <form noValidate autoComplete='on' onSubmit={e => void handleSubmit(e)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label='Nombre'
                  name='firstName'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={submitting}
                  sx={textFieldFocusSx}
                />
                <TextField
                  fullWidth
                  label='Apellido'
                  name='lastName'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={submitting}
                  sx={textFieldFocusSx}
                />
              </Box>
              <TextField
                fullWidth
                label='Correo electrónico'
                name='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
                sx={textFieldFocusSx}
              />
              <TextField
                fullWidth
                label='Contraseña'
                name='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeToTerms}
                    onChange={e => setAgreeToTerms(e.target.checked)}
                    disabled={submitting}
                  />
                }
                label='Acepto los términos y condiciones'
              />
              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={submitting || !agreeToTerms}
                sx={{
                  mt: 1,
                  height: 46,
                  backgroundColor: '#1565C0',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  '&:hover': { backgroundColor: '#0D47A1' }
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
              sx={{ color: '#1565C0', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Inicia sesión
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Register
