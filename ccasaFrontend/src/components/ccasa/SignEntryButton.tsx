'use client'

import { useCallback, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import Tooltip from '@mui/material/Tooltip'

import { apiFetch, getErrorMessage } from '@/lib/ccasa/api'
import { ENTRY_STATUS_LABELS, ROLE_LABELS } from '@/lib/ccasa/crudDisplay'
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

type SigningHint = {
  title: string
  iconClass: string
  color: string
}

function signingStatusHint(status: string): SigningHint | null {
  if (status === 'Draft') {
    return {
      title: 'Pendiente de firma del analista',
      iconClass: 'ri-time-line',
      color: 'text.disabled'
    }
  }

  if (status === 'Signed') {
    return {
      title: 'Pendiente de aprobación del supervisor',
      iconClass: 'ri-time-line',
      color: 'text.disabled'
    }
  }

  if (status === 'Locked' || status === 'Approved') {
    return {
      title: 'Entrada aprobada',
      iconClass: 'ri-checkbox-circle-line',
      color: 'success.main'
    }
  }

  return null
}

const SignEntryButton = ({ entryId, currentStatus, onSigned }: SignEntryButtonProps) => {
  const { role } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  const signatureType = role ? ROLE_TO_SIGNATURE[role] : null

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
      setError(getErrorMessage(err, 'Error al firmar'))
    } finally {
      setLoading(false)
    }
  }, [entryId, signatureType, onSigned])

  if (!canSign) {
    const hint = signingStatusHint(currentStatus)

    if (!hint) {
      return null
    }

    return (
      <Tooltip title={hint.title} arrow>
        <Box
          component='span'
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: hint.color,
            cursor: 'default',
            userSelect: 'none',
            fontSize: '1.25rem',
            lineHeight: 1
          }}
          aria-label={hint.title}
        >
          <i className={hint.iconClass} />
        </Box>
      </Tooltip>
    )
  }

  const actionLabel = role === 'Analyst' ? 'Firmar como Analista' : 'Firmar como Supervisor'

  const nextStatus = role === 'Analyst' ? ENTRY_STATUS_LABELS.Signed : ENTRY_STATUS_LABELS.Locked

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
            El estado cambiará de <strong>{ENTRY_STATUS_LABELS[currentStatus] ?? currentStatus}</strong> a{' '}
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
