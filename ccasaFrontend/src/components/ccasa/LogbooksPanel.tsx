'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import { LOGBOOK_CONFIG } from '@/lib/ccasa/crudFields'
import type { LogbookDTO } from '@/lib/ccasa/types'

// Hook Imports
import { useCrudOperations } from '@/hooks/ccasa/useCrudOperations'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Component Imports
import CrudDeleteDialog from './CrudDeleteDialog'
import CrudFormDialog from './CrudFormDialog'

type LogbooksPanelProps = {
  title?: string
  showCard?: boolean
}

function logbookToValues(dto: LogbookDTO): Record<string, unknown> {
  return {
    code: dto.code,
    name: dto.name,
    description: dto.description,
    maxEntries: dto.maxEntries
  }
}

const LogbooksPanel = ({ title = 'Bitácoras activas', showCard = true }: LogbooksPanelProps) => {
  const { token } = useAuth()

  const {
    loading: crudLoading,
    error: crudError,
    create: crudCreate,
    update: crudUpdate,
    remove: crudRemove,
    clearError: crudClearError
  } = useCrudOperations()

  const [rows, setRows] = useState<LogbookDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<LogbookDTO | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRow, setDeletingRow] = useState<LogbookDTO | null>(null)

  const [snackbar, setSnackbar] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await apiFetch<LogbookDTO[]>('/api/v1/logbooks')

      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar bitácoras')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  const handleOpenCreate = useCallback(() => {
    crudClearError()
    setEditingRow(null)
    setFormOpen(true)
  }, [crudClearError])

  const handleOpenEdit = useCallback(
    (row: LogbookDTO) => {
      crudClearError()
      setEditingRow(row)
      setFormOpen(true)
    },
    [crudClearError]
  )

  const handleCloseForm = useCallback(() => {
    if (crudLoading) {
      return
    }

    crudClearError()
    setFormOpen(false)
    setEditingRow(null)
  }, [crudClearError, crudLoading])

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      if (editingRow) {
        const res = await crudUpdate(LOGBOOK_CONFIG.apiPath, editingRow.id, values)

        if (res) {
          setFormOpen(false)
          setEditingRow(null)
          crudClearError()
          setSnackbar('Bitácora actualizada correctamente')
          void fetchRows()
        }
      } else {
        const res = await crudCreate(LOGBOOK_CONFIG.apiPath, values)

        if (res) {
          setFormOpen(false)
          setEditingRow(null)
          crudClearError()
          setSnackbar('Bitácora creada correctamente')
          void fetchRows()
        }
      }
    },
    [crudClearError, crudCreate, crudUpdate, editingRow, fetchRows]
  )

  const handleOpenDelete = useCallback(
    (row: LogbookDTO) => {
      crudClearError()
      setDeletingRow(row)
      setDeleteOpen(true)
    },
    [crudClearError]
  )

  const handleCloseDelete = useCallback(() => {
    if (crudLoading) {
      return
    }

    crudClearError()
    setDeleteOpen(false)
    setDeletingRow(null)
  }, [crudClearError, crudLoading])

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingRow) {
      return
    }

    const ok = await crudRemove(LOGBOOK_CONFIG.apiPath, deletingRow.id)

    if (ok) {
      setDeleteOpen(false)
      setDeletingRow(null)
      crudClearError()
      setSnackbar('Bitácora eliminada correctamente')
      void fetchRows()
    }
  }, [crudClearError, crudRemove, deletingRow, fetchRows])

  const formTitle = editingRow ? `Editar ${LOGBOOK_CONFIG.label.toLowerCase()}` : `Nueva ${LOGBOOK_CONFIG.label.toLowerCase()}`

  const inner = (
    <>
      {loading ? (
        <Box className='flex justify-center p-6'>
          <CircularProgress />
        </Box>
      ) : null}
      {error ? (
        <Alert severity='error' className='m-4'>
          {error}
        </Alert>
      ) : null}
      {!loading && !error && rows ? (
        <>
          <Stack direction='row' justifyContent='space-between' alignItems='center' className='mbe-2' flexWrap='wrap' useFlexGap>
            <Typography variant='body2' color='text.secondary'>
              {rows.length} bitácora{rows.length === 1 ? '' : 's'} activa{rows.length === 1 ? '' : 's'}
            </Typography>
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={handleOpenCreate}
              disabled={!token}
            >
              Nueva bitácora
            </Button>
          </Stack>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align='right'>Máx. entradas</TableCell>
                  <TableCell align='center'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align='right'>{row.maxEntries}</TableCell>
                    <TableCell align='center'>
                      <Stack direction='row' spacing={0.5} justifyContent='flex-end' alignItems='center'>
                        <Tooltip title='Ver entradas'>
                          <IconButton
                            component={Link}
                            href={`/bitacoras/${row.id}`}
                            color='primary'
                            aria-label='Ver entradas'
                            sx={{ width: 32, height: 32 }}
                          >
                            <i className='ri-eye-line' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Editar'>
                          <IconButton
                            color='default'
                            aria-label='Editar'
                            sx={{ width: 32, height: 32 }}
                            onClick={() => handleOpenEdit(row)}
                          >
                            <i className='ri-pencil-line' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Eliminar'>
                          <IconButton
                            color='error'
                            aria-label='Eliminar'
                            sx={{ width: 32, height: 32 }}
                            onClick={() => handleOpenDelete(row)}
                          >
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </>
  )

  const shell = showCard ? (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}>
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>{inner}</CardContent>
    </Card>
  ) : (
    inner
  )

  return (
    <>
      {shell}
      <CrudFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        fields={LOGBOOK_CONFIG.fields}
        title={formTitle}
        initialValues={editingRow ? logbookToValues(editingRow) : null}
        loading={crudLoading}
        error={crudError}
      />
      <CrudDeleteDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        resourceLabel={LOGBOOK_CONFIG.label}
        itemLabel={deletingRow?.name}
        loading={crudLoading}
        error={crudError}
      />
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

export default LogbooksPanel
