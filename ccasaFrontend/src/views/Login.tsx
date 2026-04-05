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

import Logo from '@components/layout/shared/Logo'
import { useAuth } from '@/contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      router.replace('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
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
      {/* Left panel - branding */}
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
          <Typography variant='h4' sx={{ color: '#FFFFFF', fontWeight: 800, mb: 2, lineHeight: 1.3 }}>
            Sistema de gestión de bitácoras
          </Typography>
          <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.8 }}>
            Administra bitácoras, entradas, catálogos y personal de tu laboratorio de forma centralizada y segura.
          </Typography>
          <Box sx={{ mt: 6, display: 'flex', gap: 4 }}>
            {[
              { num: '15', label: 'Bitácoras' },
              { num: '10', label: 'Tipos de entrada' },
              { num: '6', label: 'Catálogos' }
            ].map(stat => (
              <Box key={stat.label}>
                <Typography variant='h4' sx={{ color: '#FFFFFF', fontWeight: 700 }}>{stat.num}</Typography>
                <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>{stat.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        {/* Subtle decorative elements */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)' }} />
      </Box>

      {/* Right panel - form */}
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
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
            <Logo />
          </Box>

          <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>
            Iniciar sesión
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
            Ingresa tus credenciales para continuar
          </Typography>

          {error ? (
            <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
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
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1565C0'
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1565C0'
                  }
                }}
              />
              <TextField
                fullWidth
                label='Contraseña'
                name='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1565C0'
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#1565C0'
                  }
                }}
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
              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={submitting}
                sx={{
                  mt: 1,
                  height: 46,
                  backgroundColor: '#1565C0',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  '&:hover': { backgroundColor: '#0D47A1' }
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
              sx={{ color: '#1565C0', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Regístrate
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Login
