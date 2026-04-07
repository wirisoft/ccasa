'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

type ProfileData = {
  firstName: string
  lastName: string
  email: string
}

/** Etiqueta en español para el rol devuelto por el backend (enum `RoleNameEnum.name()`). */
function formatRoleLabel(role: string | null): string {
  if (role == null || role === '') {
    return '—'
  }

  const map: Record<string, string> = {
    Admin: 'Administrador',
    Analyst: 'Analista',
    Sampler: 'Muestreador',
    Supervisor: 'Supervisor'
  }

  return map[role] ?? role
}

const AccountDetails = () => {
  const { userId, token, role, hydrated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: ''
  })

  const [originalData, setOriginalData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: ''
  })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!token || userId == null) {
      setLoading(false)
      setError('Inicia sesión para ver tu perfil.')
      return
    }

    try {
      const res = await apiFetch<CrudResponseDTO>(`/api/v1/users/${userId}`)
      const vals = res.values ?? {}

      const profile: ProfileData = {
        firstName: String(vals.firstName ?? ''),
        lastName: String(vals.lastName ?? ''),
        email: String(vals.email ?? '')
      }

      setFormData(profile)
      setOriginalData(profile)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    void fetchProfile()
  }, [hydrated, fetchProfile])

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!token || userId == null) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await apiFetch(`/api/v1/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          values: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim()
          }
        })
      })

      setOriginalData({ ...formData })
      setSnackbar('Perfil actualizado correctamente')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormData({ ...originalData })
  }

  const hasChanges =
    formData.firstName !== originalData.firstName ||
    formData.lastName !== originalData.lastName ||
    formData.email !== originalData.email

  if (!hydrated || loading) {
    return (
      <Card>
        <CardContent>
          <Box className='flex justify-center p-6'>
            <CircularProgress size={28} />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader title='Información de la cuenta' titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
          {error ? (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : null}

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Nombre'
                value={formData.firstName}
                placeholder='Nombre'
                onChange={e => handleChange('firstName', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Apellido'
                value={formData.lastName}
                placeholder='Apellido'
                onChange={e => handleChange('lastName', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Correo electrónico'
                value={formData.email}
                placeholder='correo@ejemplo.com'
                onChange={e => handleChange('email', e.target.value)}
                disabled={saving}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Rol'
                value={formatRoleLabel(role)}
                disabled
                helperText='El rol se administra desde el módulo de empleados'
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' onClick={() => void handleSave()} disabled={saving || !hasChanges}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleReset} disabled={saving || !hasChanges}>
                Restablecer
              </Button>
            </Grid>
          </Grid>
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

export default AccountDetails
