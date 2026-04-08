'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Fade from '@mui/material/Fade'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import Logo from '@components/layout/shared/Logo'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const emailError = touched && email.trim() === ''
    ? 'El correo es obligatorio'
    : touched && !validateEmail(email.trim())
      ? 'Ingresa un correo válido'
      : null

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(true)

    if (!email.trim() || !validateEmail(email.trim())) return

    // Backend no tiene endpoint de forgot-password aún
    // Solo mostramos mensaje de confirmación
    setSubmitted(true)
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(160deg, #0D2137 0%, #132F4C 50%, #1565C0 100%)',
        px: 3,
        py: 6
      }}
    >
      <Fade in timeout={600}>
        <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Logo />
            </Box>

            {submitted ? (
              <>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(21, 101, 192, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <i className='ri-mail-check-line' style={{ fontSize: 28, color: '#1565C0' }} />
                  </Box>
                  <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                    Revisa tu correo
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
                    Si tu cuenta existe, recibirás instrucciones para restablecer tu contraseña.
                  </Typography>
                </Box>

                <Alert severity='info' sx={{ mb: 3 }}>
                  Esta funcionalidad está en desarrollo. Por ahora, contacta al administrador del sistema para restablecer tu contraseña.
                </Alert>

                <Button
                  component={Link}
                  href='/login'
                  fullWidth
                  variant='contained'
                  sx={{
                    height: 48,
                    backgroundColor: '#1565C0',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#0D47A1' }
                  }}
                >
                  Volver al inicio de sesión
                </Button>
              </>
            ) : (
              <>
                <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                  ¿Olvidaste tu contraseña?
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
                </Typography>

                <form noValidate onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      autoFocus
                      fullWidth
                      label='Correo electrónico'
                      type='email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      error={emailError != null}
                      helperText={emailError}
                      sx={{
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1565C0'
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1565C0'
                        }
                      }}
                    />

                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      sx={{
                        height: 48,
                        backgroundColor: '#1565C0',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                        '&:hover': {
                          backgroundColor: '#0D47A1',
                          boxShadow: '0 6px 16px rgba(21, 101, 192, 0.4)'
                        }
                      }}
                    >
                      Enviar instrucciones
                    </Button>

                    <Typography
                      variant='body2'
                      sx={{ textAlign: 'center', mt: 1 }}
                    >
                      <Typography
                        component={Link}
                        href='/login'
                        variant='body2'
                        sx={{
                          color: '#1565C0',
                          fontWeight: 500,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        <i className='ri-arrow-left-s-line' style={{ fontSize: 18 }} />
                        Volver al inicio de sesión
                      </Typography>
                    </Typography>
                  </Box>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </Fade>

      <Typography
        variant='caption'
        sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'rgba(255, 255, 255, 0.5)' }}
      >
        © {new Date().getFullYear()} Bitácoras Servicios Ambientales
      </Typography>
    </Box>
  )
}

export default ForgotPassword
