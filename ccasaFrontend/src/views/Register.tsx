'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const Register = ({ mode }: { mode: Mode }) => {
  const router = useRouter()
  const { register } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !password || !agreeToTerms) {
      setError('Completa todos los campos y acepta los términos y condiciones.')

      return
    }

    setLoading(true)
    setError(null)

    try {
      await register(trimmedFirst, trimmedLast, trimmedEmail, password)
      router.push('/')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al registrarse'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Crear cuenta</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Regístrate para comenzar a usar el sistema</Typography>
            {error != null ? (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            ) : null}
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <div className='flex flex-row gap-4'>
                <TextField
                  autoFocus
                  fullWidth
                  className='flex-1'
                  label='Nombre'
                  value={firstName}
                  onChange={ev => setFirstName(ev.target.value)}
                />
                <TextField
                  fullWidth
                  className='flex-1'
                  label='Apellido'
                  value={lastName}
                  onChange={ev => setLastName(ev.target.value)}
                />
              </div>
              <TextField
                fullWidth
                label='Correo electrónico'
                type='email'
                value={email}
                onChange={ev => setEmail(ev.target.value)}
              />
              <TextField
                fullWidth
                label='Contraseña'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={ev => setPassword(ev.target.value)}
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
                control={
                  <Checkbox checked={agreeToTerms} onChange={ev => setAgreeToTerms(ev.target.checked)} />
                }
                label='Acepto los términos y condiciones'
              />
              <Button fullWidth variant='contained' type='submit' disabled={loading || !agreeToTerms}>
                {loading ? 'Registrando…' : 'Registrarse'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>¿Ya tienes cuenta?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Inicia sesión
                </Typography>
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
