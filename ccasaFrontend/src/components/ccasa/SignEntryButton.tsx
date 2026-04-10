'use client'

import { useCallback, useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'

import { apiFetch } from '@/lib/ccasa/api'
import { ROLE_LABELS } from '@/lib/ccasa/crudDisplay'
import { useAuth } from '@/contexts/AuthContext'

type SignEntryButtonProps = {
  entryId: number | string
  currentStatus: string
  onSigned?: () => void
}

const ROLE_TO_SIGNATURE: Record<string, string> = {
  Analyst: 'Analyst',
  Supervisor: 'Supervisor'
}

const STATUS_LABELS: Record<string, string> = {
  Draft: 'Borrador',
  Signed: 'Firmada',
  Locked: 'Bloqueada'
}

const SignEntryButton = ({ entryId, currentStatus, onSigned }: SignEntryButtonProps) => {
  const { role } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const signatureType = role ? ROLE_TO_SIGNATURE[role] : null

  // Determinar si este usuario puede firmar según el estado actual
  const canSign =
    (currentStatus === 'Draft' && role === 'Analyst') ||
    (currentStatus === 'Signed' && role === 'Supervisor')

  const handleSign = useCallback(async () => {
    if (!signatureType) return

    setLoading(true)
    setError(null)

    try {
      await apiFetch(`/api/v1/entries/${entryId}/sign`, {
        method: 'POST',
        body: JSON.stringify({ signatureType })
      })

      setOpen(false)
      setSnackbar('Entrada firmada correctamente')
      onSigned?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al firmar')
    } finally {
      setLoading(false)
    }
  }, [entryId, signatureType, onSigned])

  if (!canSign) {
    return null
  }

  const actionLabel = role === 'Analyst' ? 'Firmar como Analista' : 'Firmar como Supervisor'

  const nextStatus = role === 'Analyst' ? 'Firmada' : 'Bloqueada'

  return (
    <>
      <Button
        variant='outlined'
        color='primary'
        size='small'
        startIcon={<i className='ri-quill-pen-line' />}
        onClick={() => setOpen(true)}
      >
        {actionLabel}
      </Button>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Confirmar firma</DialogTitle>
        <DialogContent>
          {error ? (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <DialogContentText>
            Estás a punto de firmar esta entrada como{' '}
            <strong>{role != null ? ROLE_LABELS[role] ?? role : '—'}</strong>.
            El estado cambiará de <strong>{STATUS_LABELS[currentStatus] ?? currentStatus}</strong> a{' '}
            <strong>{nextStatus}</strong>.
            {role === 'Supervisor' && (
              <> Una vez bloqueada, la entrada <strong>no podrá ser modificada ni eliminada</strong>.</>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={() => void handleSign()}
            disabled={loading}
            sx={{ backgroundColor: '#1565C0', '&:hover': { backgroundColor: '#0D47A1' } }}
          >
            {loading ? 'Firmando...' : 'Confirmar firma'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default SignEntryButton
