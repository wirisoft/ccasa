'use client'

// React Imports
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch, getErrorMessage } from '@/lib/ccasa/api'
import { LOGBOOK_CONFIG } from '@/lib/ccasa/crudFields'
import type { LogbookDTO } from '@/lib/ccasa/types'

// Hook Imports
import { useCrudOperations } from '@/hooks/ccasa/useCrudOperations'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Component Imports
import CrudDeleteDialog from './CrudDeleteDialog'
import CrudFormDialog from './CrudFormDialog'
import { getTooltipText } from './CrudListPanel'

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

  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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
      setError(getErrorMessage(e, 'Error al cargar bitácoras'))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  /** Filas filtradas por búsqueda global. */
  const filteredRows = useMemo(() => {
    if (!rows) {
      return []
    }

    if (!searchQuery.trim()) {
      return rows
    }

    const query = searchQuery.toLowerCase().trim()

    return rows.filter(
      row =>
        String(row.code ?? '').toLowerCase().includes(query) ||
        (row.name ?? '').toLowerCase().includes(query) ||
        (row.description ?? '').toLowerCase().includes(query) ||
        String(row.maxEntries ?? '').includes(query)
    )
  }, [rows, searchQuery])

  /** Filas de la página actual. */
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage

    return filteredRows.slice(start, start + rowsPerPage)
  }, [filteredRows, page, rowsPerPage])

  useEffect(() => {
    setPage(0)
  }, [searchQuery])

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

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const formTitle = editingRow ? `Editar ${LOGBOOK_CONFIG.label.toLowerCase()}` : `Nueva ${LOGBOOK_CONFIG.label.toLowerCase()}`

  const inner = (
    <>
      <Box
        sx={{
          mb: 2,
          p: '10px 16px',
          border: '1px solid #0288d1',
          borderRadius: 1,
          backgroundColor: '#e1f5fe',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1
        }}
      >
        <i className='ri-information-line' style={{ color: '#0288d1', fontSize: 18, marginTop: 1, flexShrink: 0 }} />
        <Typography variant='body2' sx={{ color: '#01579b', fontSize: '0.82rem' }}>
          Las bitácoras son los libros de registro del laboratorio. El sistema crea automáticamente 15 bitácoras
          (códigos 1–15). Cada entrada de laboratorio pertenece a una bitácora.
        </Typography>
      </Box>
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
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            className='mbe-2'
            flexWrap='wrap'
            useFlexGap
            spacing={1}
          >
            <Typography variant='body2' color='text.secondary'>
              {searchQuery.trim()
                ? `${filteredRows.length} de ${rows.length} bitácora${rows.length === 1 ? '' : 's'}`
                : `${rows.length} bitácora${rows.length === 1 ? '' : 's'} activa${rows.length === 1 ? '' : 's'}`}
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <TextField
                size='small'
                placeholder='Buscar...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 220 } }}
                inputProps={{ 'aria-label': 'Buscar bitácoras' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' style={{ fontSize: 18, opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                  ...(searchQuery
                    ? {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton size='small' onClick={() => setSearchQuery('')} aria-label='Limpiar búsqueda'>
                              <i className='ri-close-line' style={{ fontSize: 16 }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    : {})
                }}
              />
              <Tooltip
                title={getTooltipText(LOGBOOK_CONFIG.label, LOGBOOK_CONFIG.apiPath)}
                arrow
                placement='left'
              >
                <span>
                  <Button
                    variant='contained'
                    size='small'
                    startIcon={<i className='ri-add-line' />}
                    onClick={handleOpenCreate}
                    disabled={!token}
                  >
                    Nueva bitácora
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
          {rows.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
              No hay bitácoras registradas. Crea la primera con el botón &quot;+ Nueva bitácora&quot;.
            </Typography>
          ) : rows.length > 0 && filteredRows.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ py: 3 }}>
              No se encontraron bitácoras que coincidan con la búsqueda.
            </Typography>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto', maxHeight: 440 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 60 }}>#</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell align='right'>Máx. entradas</TableCell>
                      <TableCell align='center'>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ width: 60, color: 'text.secondary' }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
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
              <TablePagination
                component='div'
                count={filteredRows.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage='Filas por página:'
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              />
            </>
          )}
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
