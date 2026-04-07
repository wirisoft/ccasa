'use client'

// React Imports
import type { ChangeEvent } from 'react'
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
import { apiFetch } from '@/lib/ccasa/api'
import { buildFkLookupMap, collectCrudColumns, getColumnLabel, resolveFkDisplay } from '@/lib/ccasa/crudDisplay'
import type { CrudFieldDef } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO, FkLookupMap } from '@/lib/ccasa/types'

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
  const [fkLookups, setFkLookups] = useState<FkLookupMap>({})

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
      const data = await apiFetch<CrudResponseDTO[]>(apiPath)

      if (apiPath === '/api/v1/entries') {
        console.log('[CrudListPanel] GET /api/v1/entries response', data)
      }

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

  useEffect(() => {
    if (!fields || fields.length === 0) {
      setFkLookups({})
      return
    }

    let cancelled = false

    buildFkLookupMap(fields).then(map => {
      if (!cancelled) setFkLookups(map)
    })

    return () => {
      cancelled = true
    }
  }, [fields])

  const columns = useMemo(() => (rows && rows.length > 0 ? collectCrudColumns(rows) : ['id']), [rows])

  /** Filas filtradas por búsqueda global (busca en todos los valores visibles, incluyendo FKs resueltas). */
  const filteredRows = useMemo(() => {
    if (!rows) {
      return []
    }

    if (!searchQuery.trim()) {
      return rows
    }

    const query = searchQuery.toLowerCase().trim()

    return rows.filter(row =>
      columns
        .filter(col => col !== 'id')
        .some(col => {
          const displayValue = resolveFkDisplay(row.values?.[col], col, fkLookups)

          return displayValue.toLowerCase().includes(query)
        })
    )
  }, [rows, searchQuery, columns, fkLookups])

  /** Filas de la página actual (paginación sobre filteredRows). */
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

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

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
                ? `${filteredRows.length} de ${rows.length} registro${rows.length === 1 ? '' : 's'}`
                : `${rows.length} registro${rows.length === 1 ? '' : 's'}`}
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center'>
              <TextField
                size='small'
                placeholder='Buscar...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ minWidth: 220 }}
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
              {hasWrite ? (
                <Button
                  variant='contained'
                  startIcon={<i className='ri-add-line' />}
                  onClick={handleOpenCreate}
                  disabled={!token}
                >
                  Nuevo
                </Button>
              ) : null}
            </Stack>
          </Stack>
          {rows.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No hay registros activos.
            </Typography>
          ) : filteredRows.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No se encontraron registros que coincidan con la búsqueda.
            </Typography>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 60 }}>#</TableCell>
                      {columns.filter(col => col !== 'id').map(col => (
                        <TableCell key={col}>{getColumnLabel(col)}</TableCell>
                      ))}
                      {hasWrite ? <TableCell align='center'>Acciones</TableCell> : null}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ width: 60, color: 'text.secondary' }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        {columns.filter(col => col !== 'id').map(col => (
                          <TableCell key={col}>{resolveFkDisplay(row.values?.[col], col, fkLookups)}</TableCell>
                        ))}
                        {hasWrite ? (
                          <TableCell align='center'>
                            <Stack direction='row' spacing={0.5} justifyContent='flex-end' alignItems='center'>
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
                        ) : null}
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
