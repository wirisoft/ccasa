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
import { apiFetch, getApiBaseUrl, getErrorMessage, getHttpErrorMessage, PDF_DOWNLOAD_ERROR } from '@/lib/ccasa/api'
import {
  buildFkLookupMap,
  collectCrudColumns,
  getColumnLabel,
  getSectionInfo,
  resolveFkDisplay,
  resolveFkDisplayPlain
} from '@/lib/ccasa/crudDisplay'
import type { CrudFieldDef } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO, FkLookupMap } from '@/lib/ccasa/types'

// Hook Imports
import { useCrudOperations } from '@/hooks/ccasa/useCrudOperations'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Component Imports
import CrudDeleteDialog from './CrudDeleteDialog'
import CrudFormDialog from './CrudFormDialog'
import SignEntryButton from './SignEntryButton'

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
  if (!values) {
    return undefined
  }

  if (nameColumn === 'firstName' && 'firstName' in values && 'lastName' in values) {
    const fn = values.firstName
    const ln = values.lastName

    if (fn == null && ln == null) {
      return undefined
    }

    const s = `${fn != null ? String(fn).trim() : ''} ${ln != null ? String(ln).trim() : ''}`.trim()

    return s === '' ? undefined : s
  }

  if (!(nameColumn in values)) {
    return undefined
  }

  const v = values[nameColumn]

  if (v === null || v === undefined) {
    return undefined
  }

  const s = String(v).trim()

  return s === '' ? undefined : s
}

export function getTooltipText(resourceLabel: string, apiPath: string): string {
  if (apiPath.includes('logbooks')) {
    return 'Crea una nueva bitácora. Necesitas definir código, nombre y descripción.'
  }

  if (apiPath.includes('folios')) {
    return 'Crea un folio. Requiere seleccionar una bitácora y un bloque de folios activo.'
  }

  if (apiPath.includes('folio-blocks')) {
    return 'Crea un bloque de folios con rango de números (inicio y fin).'
  }

  if (apiPath.includes('reagents')) {
    return 'Registra un nuevo reactivo con nombre y descripción.'
  }

  if (apiPath.includes('batches')) {
    return 'Registra un lote de reactivo. Necesitas tener un reactivo creado.'
  }

  if (apiPath.includes('solutions')) {
    return 'Registra una solución con nombre y concentración.'
  }

  if (apiPath.includes('supplies')) {
    return 'Registra un insumo de laboratorio.'
  }

  if (apiPath.includes('reagent-jars')) {
    return 'Registra un frasco de reactivo. Necesitas tener un reactivo creado y definir las cantidades inicial y actual.'
  }

  if (apiPath.includes('equipment')) {
    return 'Registra un equipo de laboratorio con tipo y denominación.'
  }

  if (apiPath.includes('reference-parameters')) {
    return 'Registra un parámetro de referencia con código y valores min/max.'
  }

  if (apiPath.includes('roles')) {
    return 'Crea un rol de usuario nuevo.'
  }

  if (apiPath.includes('alerts')) {
    return 'Crea una alerta. Requiere tipo, mensaje y estado.'
  }

  if (apiPath.includes('signatures')) {
    return 'Registra una firma de entrada. Requiere tipo de firma y seleccionar una entrada.'
  }

  if (apiPath.includes('users')) {
    return 'Crea un nuevo usuario. Necesitas nombre, apellido, correo, contraseña y rol.'
  }

  if (apiPath.includes('entries')) {
    return 'Crea una nueva entrada de registro. Requiere seleccionar una bitácora activa.'
  }

  if (apiPath.includes('entry-distilled-water')) {
    return 'Registra una entrada de agua destilada.'
  }

  if (apiPath.includes('entry-conductivity')) {
    return 'Registra una medición de conductividad. Solo necesitas el tipo (Alta/Baja) y el peso en gramos.'
  }

  if (apiPath.includes('entry-oven-temp')) {
    return 'Registra temperatura de horno. Requiere una entrada base.'
  }

  if (apiPath.includes('entry-drying-oven')) {
    return 'Registra una entrada de horno de secado.'
  }

  if (apiPath.includes('entry-expense-chart')) {
    return 'Registra un gasto o carta.'
  }

  if (apiPath.includes('entry-material-wash')) {
    return 'Registra un lavado de material.'
  }

  if (apiPath.includes('entry-solution-prep')) {
    return 'Registra una preparación de solución.'
  }

  if (apiPath.includes('entry-weighing')) {
    return 'Registra una pesada.'
  }

  if (apiPath.includes('entry-accuracy')) {
    return 'Registra una medición de precisión.'
  }

  if (apiPath.includes('entry-flask-treatment')) {
    return 'Registra un tratamiento de matraz.'
  }

  return `Crear nuevo registro de ${resourceLabel ?? 'este módulo'}`
}

function crudPdfFilePrefix(apiPath: string): string {
  if (apiPath.includes('entry-material-wash')) {
    return 'lavado-material'
  }

  if (apiPath.includes('entry-solution-prep')) {
    return 'prep-solucion'
  }

  if (apiPath.includes('entry-weighing')) {
    return 'pesada'
  }

  return 'registro'
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

      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(getErrorMessage(e, 'Error al cargar datos'))
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

  const showPdfExport = useMemo(
    () =>
      apiPath.includes('entry-weighing') ||
      apiPath.includes('entry-solution-prep') ||
      apiPath.includes('entry-material-wash'),
    [apiPath]
  )

  const pdfDownloadPrefix = useMemo(() => crudPdfFilePrefix(apiPath), [apiPath])

  const handleDownloadPdf = useCallback(
    async (rowId: number) => {
      if (!token) {
        return
      }

      try {
        const res = await fetch(`${getApiBaseUrl()}${apiPath}/${encodeURIComponent(String(rowId))}/pdf`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          let msg = ''

          try {
            const errJson = (await res.json()) as { message?: string; error?: string }

            msg = errJson.message || errJson.error || ''
          } catch {
            /* ignore */
          }

          setSnackbar(msg || getHttpErrorMessage(res.status))

          return
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')

        a.href = url
        a.download = `${pdfDownloadPrefix}-${rowId}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        setSnackbar('PDF exportado correctamente')
      } catch (e) {
        setSnackbar(getErrorMessage(e, PDF_DOWNLOAD_ERROR))
      }
    },
    [token, apiPath, pdfDownloadPrefix]
  )

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
          const displayValue = resolveFkDisplayPlain(row.values?.[col], col, fkLookups)

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

  const newRecordTooltip = getTooltipText(resourceLabel, apiPath)
  const sectionInfo = getSectionInfo(apiPath)

  const sectionInfoAlert =
    sectionInfo != null ? (
      <Box sx={{ px: 2, pb: 0, pt: 0 }}>
        <Alert severity='info' variant='outlined' sx={{ mb: 2, fontSize: '0.82rem' }}>
          {sectionInfo}
        </Alert>
      </Box>
    ) : null

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
                sx={{ minWidth: { xs: '100%', sm: 220 } }}
                inputProps={{ 'aria-label': 'Buscar registros' }}
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
                <Tooltip title={newRecordTooltip} arrow placement='left'>
                  <span>
                    <Button
                      variant='contained'
                      size='small'
                      onClick={handleOpenCreate}
                      disabled={!token}
                      startIcon={<i className='ri-add-line' />}
                    >
                      Nuevo registro
                    </Button>
                  </span>
                </Tooltip>
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
              <TableContainer sx={{ maxHeight: 440, overflow: 'auto' }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 60 }}>#</TableCell>
                      {columns.filter(col => col !== 'id').map(col => (
                        <TableCell key={col}>{getColumnLabel(col)}</TableCell>
                      ))}
                      {showPdfExport ? (
                        <TableCell align='center' sx={{ width: 56 }}>
                          PDF
                        </TableCell>
                      ) : null}
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
                        {showPdfExport ? (
                          <TableCell align='center'>
                            <Tooltip title='Exportar PDF' arrow>
                              <span>
                                <IconButton
                                  size='small'
                                  color='error'
                                  aria-label='PDF'
                                  sx={{ width: 32, height: 32 }}
                                  disabled={!token}
                                  onClick={() => void handleDownloadPdf(row.id)}
                                >
                                  <Box component='i' className='ri-file-pdf-line' />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        ) : null}
                        {hasWrite ? (
                          <TableCell align='center'>
                            <Stack direction='row' spacing={0.5} justifyContent='flex-end' alignItems='center'>
                              {apiPath === '/api/v1/entries' && row.values?.status ? (
                                <SignEntryButton
                                  entryId={row.id}
                                  currentStatus={String(row.values.status)}
                                  onSigned={fetchRows}
                                />
                              ) : null}
                              <Tooltip title='Editar'>
                                <span>
                                  <IconButton
                                    color='default'
                                    aria-label='Editar'
                                    sx={{ width: 32, height: 32 }}
                                    onClick={() => handleOpenEdit(row)}
                                    disabled={apiPath.includes('entries') && row.values?.status === 'Locked'}
                                  >
                                    <i className='ri-pencil-line' />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title='Eliminar'>
                                <span>
                                  <IconButton
                                    color='error'
                                    aria-label='Eliminar'
                                    sx={{ width: 32, height: 32 }}
                                    onClick={() => handleOpenDelete(row)}
                                    disabled={apiPath.includes('entries') && row.values?.status === 'Locked'}
                                  >
                                    <i className='ri-delete-bin-line' />
                                  </IconButton>
                                </span>
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
      {sectionInfoAlert}
      <CardContent>{inner}</CardContent>
    </Card>
  ) : (
    <>
      {sectionInfoAlert}
      {inner}
    </>
  )

  if (!hasWrite) {
    return (
      <>
        {shell}
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
