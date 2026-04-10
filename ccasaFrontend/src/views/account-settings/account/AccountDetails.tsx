'use client'

// React Imports
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

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
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import { ROLE_LABELS } from '@/lib/ccasa/crudDisplay'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

type ProfileData = {
  firstName: string
  lastName: string
  email: string
}

const SIGNATURE_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'] as const

function signatureNameFromValues(vals: Record<string, unknown>): string | null {
  const sf = vals.signatureFileName
  const s = sf != null ? String(sf).trim() : ''

  return s !== '' ? s : null
}

const AccountDetails = () => {
  const { userId, token, role, hydrated, email, firstName, lastName } = useAuth()

  const canEditProfile = role === 'Admin' || role === 'Supervisor'

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

  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [signatureFileName, setSignatureFileName] = useState<string | null>(null)
  const [uploadingSignature, setUploadingSignature] = useState(false)
  const [signatureError, setSignatureError] = useState<string | null>(null)

  const signatureFileInputRef = useRef<HTMLInputElement>(null)

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
      setSignatureFileName(signatureNameFromValues(vals))
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

    if (!canEditProfile) {
      if (!token || userId == null) {
        setLoading(false)
        setError('Inicia sesión para ver tu perfil.')

        return
      }

      const profile: ProfileData = {
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        email: email ?? ''
      }

      setFormData(profile)
      setOriginalData(profile)
      setError(null)
      setLoading(false)

      return
    }

    void fetchProfile()
  }, [hydrated, canEditProfile, fetchProfile, token, userId, firstName, lastName, email])

  useEffect(() => {
    if (!hydrated || !token || userId == null || canEditProfile) {
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const res = await apiFetch<CrudResponseDTO>(`/api/v1/users/${userId}`)

        if (cancelled) {
          return
        }

        const vals = res.values ?? {}

        setSignatureFileName(signatureNameFromValues(vals))
      } catch {
        /* ignorar: la tarjeta de firma sigue usable */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hydrated, token, userId, canEditProfile])

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!canEditProfile || !token || userId == null) {
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

  const handleSignatureFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    if (!SIGNATURE_ALLOWED_TYPES.includes(file.type as (typeof SIGNATURE_ALLOWED_TYPES)[number])) {
      setSignatureError('Solo se permiten archivos PNG, JPG, JPEG, WEBP o GIF.')

      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setSignatureError('El archivo no debe superar 2 MB.')

      return
    }

    setSignatureError(null)
    setSignatureFile(file)

    const reader = new FileReader()

    reader.onload = ev => {
      const result = ev.target?.result

      if (typeof result === 'string') {
        setSignaturePreview(result)
      }
    }

    reader.readAsDataURL(file)
  }

  const clearSignatureSelection = () => {
    setSignatureFile(null)
    setSignaturePreview(null)
    setSignatureError(null)

    if (signatureFileInputRef.current) {
      signatureFileInputRef.current.value = ''
    }
  }

  const handleUploadSignature = async () => {
    if (!signatureFile || userId == null) {
      return
    }

    setUploadingSignature(true)
    setSignatureError(null)

    try {
      const formDataUpload = new FormData()

      formDataUpload.append('file', signatureFile)

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8082'

      const res = await fetch(`${baseUrl}/api/v1/users/${userId}/signature-file`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formDataUpload
      })

      if (!res.ok) {
        let msg = res.statusText

        try {
          const errJson = (await res.json()) as { message?: string; error?: string }

          msg = errJson.message || errJson.error || msg
        } catch {
          /* cuerpo no JSON */
        }

        throw new Error(msg || `Error ${res.status}`)
      }

      const data = (await res.json()) as {
        userId: number
        fileName: string
        contentType: string
        storagePath: string
        uploadedAt: string
      }

      setSignatureFileName(data.fileName)
      clearSignatureSelection()
      setSnackbar('Firma subida correctamente')
    } catch (e) {
      setSignatureError(e instanceof Error ? e.message : 'Error al subir la firma')
    } finally {
      setUploadingSignature(false)
    }
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
      <Stack spacing={4}>
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
                  disabled={!canEditProfile || saving}
                  InputProps={{ readOnly: !canEditProfile }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Apellido'
                  value={formData.lastName}
                  placeholder='Apellido'
                  onChange={e => handleChange('lastName', e.target.value)}
                  disabled={!canEditProfile || saving}
                  InputProps={{ readOnly: !canEditProfile }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Correo electrónico'
                  value={formData.email}
                  placeholder='correo@ejemplo.com'
                  onChange={e => handleChange('email', e.target.value)}
                  disabled={!canEditProfile || saving}
                  InputProps={{ readOnly: !canEditProfile }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Rol'
                  value={role == null || role === '' ? '—' : ROLE_LABELS[role] ?? role}
                  disabled
                  helperText='El rol se administra desde el módulo de empleados'
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              {canEditProfile ? (
                <Grid item xs={12} className='flex gap-4 flex-wrap'>
                  <Button variant='contained' onClick={() => void handleSave()} disabled={saving || !hasChanges}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                  <Button variant='outlined' color='secondary' onClick={handleReset} disabled={saving || !hasChanges}>
                    Restablecer
                  </Button>
                </Grid>
              ) : null}
            </Grid>

            {!canEditProfile && !error ? (
              <Alert severity='info' sx={{ mt: 3 }}>
                Para modificar tu información de perfil, contacta al administrador.
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title='Firma digital' titleTypographyProps={{ variant: 'h6' }} />
          <CardContent>
            {signatureError ? (
              <Alert severity='error' sx={{ mb: 3 }} onClose={() => setSignatureError(null)}>
                {signatureError}
              </Alert>
            ) : null}

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 160,
                bgcolor: 'action.hover',
                mb: 3
              }}
            >
              {signaturePreview ? (
                <Box
                  component='img'
                  src={signaturePreview}
                  alt='Vista previa de firma'
                  sx={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
                />
              ) : (
                <>
                  <Box component='i' className='ri-image-line' sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                  <Typography variant='body2' color='text.secondary' textAlign='center'>
                    {signatureFileName
                      ? `Firma actual: ${signatureFileName}`
                      : 'Selecciona una imagen para ver la vista previa'}
                  </Typography>
                </>
              )}
            </Box>

            <input
              ref={signatureFileInputRef}
              type='file'
              hidden
              accept={SIGNATURE_ALLOWED_TYPES.join(',')}
              onChange={handleSignatureFileChange}
            />

            <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1} sx={{ mb: 2 }}>
              <Button
                variant='outlined'
                disabled={uploadingSignature || userId == null}
                startIcon={<Box component='i' className='ri-image-add-line' />}
                onClick={() => signatureFileInputRef.current?.click()}
              >
                Seleccionar imagen
              </Button>

              {signatureFile ? (
                <Button
                  variant='contained'
                  disabled={uploadingSignature}
                  startIcon={
                    uploadingSignature ? (
                      <CircularProgress size={18} color='inherit' />
                    ) : (
                      <Box component='i' className='ri-upload-cloud-2-line' />
                    )
                  }
                  onClick={() => void handleUploadSignature()}
                >
                  {uploadingSignature ? 'Subiendo...' : 'Guardar firma'}
                </Button>
              ) : null}

              {signaturePreview ? (
                <Button variant='text' color='inherit' onClick={clearSignatureSelection} disabled={uploadingSignature}>
                  Cancelar
                </Button>
              ) : null}
            </Stack>

            <Alert severity='info' variant='outlined'>
              Formatos aceptados: PNG, JPG, JPEG, WEBP, GIF. Tamaño máximo: 2 MB. Tu firma aparecerá en los reportes de
              conductividad.
            </Alert>
          </CardContent>
        </Card>
      </Stack>

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
