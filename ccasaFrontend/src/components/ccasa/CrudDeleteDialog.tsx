'use client'

// React Imports
import { useCallback } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

export type CrudDeleteDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  resourceLabel: string
  itemLabel?: string
  loading?: boolean
  error?: string | null
}

const CrudDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  resourceLabel,
  itemLabel,
  loading = false,
  error = null
}: CrudDeleteDialogProps) => {
  const handleClose = useCallback(() => {
    if (loading) {
      return
    }

    onClose()
  }, [loading, onClose])

  const handleConfirm = useCallback(() => {
    if (loading) {
      return
    }

    void Promise.resolve(onConfirm())
  }, [loading, onConfirm])

  const targetPhrase =
    itemLabel != null && itemLabel.trim() !== ''
      ? `¿Estás seguro de que deseas eliminar "${itemLabel.trim()}"? Esta acción no se puede deshacer.`
      : '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.'

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='xs'
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 3 }}>{`Eliminar ${resourceLabel}`}</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        ) : null}
        <DialogContentText>{targetPhrase}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button type='button' variant='outlined' color='secondary' onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          <Button
            type='button'
            color='error'
            variant='contained'
            sx={{ minWidth: 120 }}
            onClick={handleConfirm}
            disabled={loading}
          >
            Eliminar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default CrudDeleteDialog
