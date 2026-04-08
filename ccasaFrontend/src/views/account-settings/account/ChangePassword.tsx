'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'

import { apiFetch } from '@/lib/ccasa/api'
import { useAuth } from '@/contexts/AuthContext'

const ChangePassword = () => {
  const { token } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos.')

      return
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')

      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.')

      return
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual.')

      return
    }

    setSaving(true)

    try {
      await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSnackbar('Contraseña actualizada correctamente')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  const eyeIcon = (show: boolean, toggle: () => void) => (
    <InputAdornment position='end'>
      <IconButton size='small' edge='end' onClick={toggle} onMouseDown={e => e.preventDefault()}>
        <i className={show ? 'ri-eye-off-line' : 'ri-eye-line'} />
      </IconButton>
    </InputAdornment>
  )

  return (
    <>
      <Card>
        <CardHeader title='Cambiar contraseña' titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
          {error ? (
            <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          ) : null}

          <form onSubmit={e => void handleSubmit(e)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Contraseña actual'
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  disabled={saving}
                  InputProps={{ endAdornment: eyeIcon(showCurrent, () => setShowCurrent(s => !s)) }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Nueva contraseña'
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={saving}
                  helperText='Mínimo 6 caracteres'
                  InputProps={{ endAdornment: eyeIcon(showNew, () => setShowNew(s => !s)) }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Confirmar nueva contraseña'
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={saving}
                  error={confirmPassword !== '' && newPassword !== confirmPassword}
                  helperText={
                    confirmPassword !== '' && newPassword !== confirmPassword
                      ? 'Las contraseñas no coinciden'
                      : undefined
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={saving || !token}
                  sx={{ backgroundColor: '#1565C0', '&:hover': { backgroundColor: '#0D47A1' } }}
                >
                  {saving ? 'Guardando...' : 'Cambiar contraseña'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar != null}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}

export default ChangePassword
