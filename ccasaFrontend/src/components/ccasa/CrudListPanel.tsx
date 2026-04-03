'use client'

// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

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
import { collectCrudColumns, formatCrudCell } from '@/lib/ccasa/crudDisplay'
import type { CrudFieldDef } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

// Hook Imports
import { useCrudOperations } from '@/hooks/ccasa/useCrudOperations'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Component Imports
import CrudDeleteDialog from './CrudDeleteDialog'
import CrudFormDialog from './CrudFormDialog'

export type CrudListPanelProps = {

  /** Path API, p. ej. /api/v1/users */
  apiPath: string
  title?: string
  subtitle?: string
  showCard?: boolean

  /** Si se define y tiene al menos un campo, se habilitan crear/editar/eliminar. */
  fields?: CrudFieldDef[]

  /** Etiqueta singular para diálogos (p. ej. "Reactivo"). */
  resourceLabel?: string

  /** Clave en `values` usada como nombre en el diálogo de eliminar. */
  nameColumn?: string
}

function rowDisplayName(values: Record<string, unknown> | undefined, nameColumn: string): string | undefined {
  if (!values || !(nameColumn in values)) {
    return undefined
  }

  const v = values[nameColumn]

  if (v === null || v === undefined) {
    return undefined
  }

  const s = String(v).trim()

  return s === '' ? undefined : s
}

const CrudListPanel = ({
  apiPath,
  title = 'Registros',
  subtitle,
  showCard = true,
  fields,
  resourceLabel = 'Registro',
  nameColumn = 'name'
}: CrudListPanelProps) => {
  const { token } = useAuth()

  const {
    loading: crudLoading,
    error: crudError,
    create: crudCreate,
    update: crudUpdate,
    remove: crudRemove,
    clearError: crudClearError
  } = useCrudOperations()

  const hasWrite = fields != null && fields.length > 0

  const [rows, setRows] = useState<CrudResponseDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<CrudResponseDTO | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRow, setDeletingRow] = useState<CrudResponseDTO | null>(null)

  const [snackbar, setSnackbar] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await apiFetch<CrudResponseDTO[]>(apiPath)

      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [token, apiPath])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  const columns = useMemo(() => (rows && rows.length > 0 ? collectCrudColumns(rows) : ['id']), [rows])

  const handleOpenCreate = useCallback(() => {
    crudClearError()
    setEditingRow(null)
    setFormOpen(true)
  }, [crudClearError])

  const handleOpenEdit = useCallback(
    (row: CrudResponseDTO) => {
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
        const res = await crudUpdate(apiPath, editingRow.id, values)

        if (res) {
          setFormOpen(false)
          setEditingRow(null)
          crudClearError()
          setSnackbar(`${resourceLabel} actualizado correctamente`)
          void fetchRows()
        }
      } else {
        const res = await crudCreate(apiPath, values)

        if (res) {
          setFormOpen(false)
          setEditingRow(null)
          crudClearError()
          setSnackbar(`${resourceLabel} creado correctamente`)
          void fetchRows()
        }
      }
    },
    [apiPath, crudClearError, crudCreate, crudUpdate, editingRow, fetchRows, resourceLabel]
  )

  const handleOpenDelete = useCallback(
    (row: CrudResponseDTO) => {
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

    const ok = await crudRemove(apiPath, deletingRow.id)

    if (ok) {
      setDeleteOpen(false)
      setDeletingRow(null)
      crudClearError()
      setSnackbar(`${resourceLabel} eliminado correctamente`)
      void fetchRows()
    }
  }, [apiPath, crudClearError, crudRemove, deletingRow, fetchRows, resourceLabel])

  const formTitle = editingRow ? `Editar ${resourceLabel.toLowerCase()}` : `Nuevo ${resourceLabel.toLowerCase()}`

  const inner = (
    <>
      {subtitle ? (
        <Typography variant='body2' color='text.secondary' className='mbe-4'>
          {subtitle}
        </Typography>
      ) : null}
      {loading ? (
        <Box className='flex justify-center p-6'>
          <CircularProgress size={28} />
        </Box>
      ) : null}
      {error ? (
        <Alert severity='error' className='mbe-4'>
          {error}
        </Alert>
      ) : null}
      {!loading && !error && rows ? (
        <>
          <Typography variant='body2' color='text.secondary' className='mbe-2'>
            {rows.length} registro{rows.length === 1 ? '' : 's'}
          </Typography>
          {hasWrite ? (
            <Stack direction='row' justifyContent='flex-end' className='mbe-2'>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={handleOpenCreate}
                disabled={!token}
              >
                Nuevo
              </Button>
            </Stack>
          ) : null}
          {rows.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No hay registros activos.
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map(col => (
                      <TableCell key={col}>{col}</TableCell>
                    ))}
                    {hasWrite ? <TableCell align='right'>Acciones</TableCell> : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.id} hover>
                      {columns.map(col => (
                        <TableCell key={col}>
                          {col === 'id' ? formatCrudCell(row.id) : formatCrudCell(row.values?.[col])}
                        </TableCell>
                      ))}
                      {hasWrite ? (
                        <TableCell align='right'>
                          <Tooltip title='Editar'>
                            <IconButton
                              size='small'
                              aria-label='Editar'
                              onClick={() => handleOpenEdit(row)}
                            >
                              <i className='ri-pencil-line' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Eliminar'>
                            <IconButton
                              color='error'
                              size='small'
                              aria-label='Eliminar'
                              onClick={() => handleOpenDelete(row)}
                            >
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : null}
    </>
  )

  const shell = showCard ? (
    <Card variant='outlined'>
      <CardHeader title={title} titleTypographyProps={{ variant: 'subtitle1' }} />
      <CardContent>{inner}</CardContent>
    </Card>
  ) : (
    inner
  )

  if (!hasWrite) {
    return shell
  }

  return (
    <>
      {shell}
      <CrudFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        fields={fields}
        title={formTitle}
        initialValues={editingRow ? { ...editingRow.values } : null}
        loading={crudLoading}
        error={crudError}
      />
      <CrudDeleteDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        resourceLabel={resourceLabel}
        itemLabel={rowDisplayName(deletingRow?.values, nameColumn)}
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

export default CrudListPanel
