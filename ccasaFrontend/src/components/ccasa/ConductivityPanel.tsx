'use client'

import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
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

import { useAuth } from '@/contexts/AuthContext'
import { apiFetch, getApiBaseUrl, getHttpErrorMessage } from '@/lib/ccasa/api'
import type { LogbookDTO } from '@/lib/ccasa/types'

type ConductivityType = 'High' | 'Low'
type EntryStatus = 'Draft' | 'Signed' | 'Locked'

interface ConductivityRecord {
  conductivityId: number
  entryId: number | null
  displayFolio: string | null
  type: ConductivityType
  weightGrams: number
  referenceUScm: number | null
  referenceMol: number | null
  calculatedMol: number | null
  referenceStandardUScm: number | null
  calculatedValue: number | null
  inRange: boolean | null
  recordedAt: string | null
  preparationTime: string | null
  observation: string | null
  status: EntryStatus | null
  createdByUserId: number | null
  createdByName: string | null
  createdByNomenclature: string | null
  reviewerUserId: number | null
  reviewerName: string | null
  reviewerNomenclature: string | null
  reviewedAt: string | null
}

interface CreateConductivityRequest {
  type: ConductivityType
  weightGrams: number
  logbookId?: number | null
  recordedAt?: string | null
  preparationTime?: string | null
  observation?: string | null
}

const CONDUCTIVITY_API = '/api/v1/conductivity-records'
const LOGBOOKS_API = '/api/v1/logbooks'

function typeLabel(t: ConductivityType | null | undefined): string {
  if (t === 'High') return 'Alta'
  if (t === 'Low') return 'Baja'
  
return String(t ?? '')
}

function formatWeight(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return '—'
  
return Number(v).toFixed(4)
}

function formatConductivityZero(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return '—'
  
return Math.round(Number(v)).toString()
}

function formatDateDdMmYyyy(iso: string | null | undefined): string {
  if (iso == null || iso === '') return '—'
  const s = String(iso)
  const d = new Date(s)

  if (Number.isNaN(d.getTime())) return '—'
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()

  
return `${day}/${month}/${year}`
}

function inRangeChip(inRange: boolean | null | undefined) {
  if (inRange === true) {
    return <Chip size='small' color='success' label='Sí' />
  }

  if (inRange === false) {
    return <Chip size='small' color='error' label='No' />
  }

  
return <Chip size='small' variant='outlined' label='—' />
}

function statusChip(status: EntryStatus | null | undefined) {
  if (status === 'Draft') {
    return <Chip size='small' color='default' label='Borrador' />
  }

  if (status === 'Signed') {
    return <Chip size='small' color='warning' label='Firmado' />
  }

  if (status === 'Locked') {
    return <Chip size='small' color='success' label='Aprobado' />
  }

  
return <Chip size='small' variant='outlined' label='—' />
}

function recordMatchesSearch(record: ConductivityRecord, q: string): boolean {
  if (!q) return true
  const nq = q.trim().toLowerCase()
  const folio = (record.displayFolio ?? '').toLowerCase()
  const tipo = typeLabel(record.type).toLowerCase()
  const creador = (record.createdByName ?? '').toLowerCase()
  const revisor = (record.reviewerName ?? '').toLowerCase()

  
return (
    folio.includes(nq) ||
    tipo.includes(nq) ||
    creador.includes(nq) ||
    revisor.includes(nq)
  )
}

function buildListQuery(
  filterType: string,
  filterStatus: string,
  filterFromDate: string,
  filterToDate: string
): string {
  const params = new URLSearchParams()

  if (filterType === 'High' || filterType === 'Low') {
    params.set('type', filterType)
  }

  if (filterStatus === 'Draft' || filterStatus === 'Signed' || filterStatus === 'Locked') {
    params.set('status', filterStatus)
  }

  if (filterFromDate) {
    params.set('fromDate', filterFromDate)
  }

  if (filterToDate) {
    params.set('toDate', filterToDate)
  }

  const qs = params.toString()

  
return qs ? `${CONDUCTIVITY_API}?${qs}` : CONDUCTIVITY_API
}

const ConductivityPanel = () => {
  const { token } = useAuth()

  const [records, setRecords] = useState<ConductivityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewing, setReviewing] = useState<number | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [confirmReviewOpen, setConfirmReviewOpen] = useState(false)
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /** Filtros en la barra (UI); se aplican al servidor solo al pulsar Buscar. */
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')


  /** Filtros ya enviados al backend (incluye carga inicial vacía). */
  const [appliedFilters, setAppliedFilters] = useState({
    type: '',
    status: '',
    fromDate: '',
    toDate: ''
  })

  const [formType, setFormType] = useState<ConductivityType | ''>('High')
  const [formWeight, setFormWeight] = useState('')
  const [formPreparationTime, setFormPreparationTime] = useState('')
  const [formObservation, setFormObservation] = useState('')
  const [logbooks, setLogbooks] = useState<LogbookDTO[]>([])
  const [formLogbookId, setFormLogbookId] = useState('')

  const [snackbar, setSnackbar] = useState<string | null>(null)
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const [formError, setFormError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    if (!token) {
      setLoading(false)
      
return
    }

    setLoading(true)
    setError(null)

    try {
      const url = buildListQuery(
        appliedFilters.type,
        appliedFilters.status,
        appliedFilters.fromDate,
        appliedFilters.toDate
      )

      const data = await apiFetch<ConductivityRecord[]>(url)

      setRecords(Array.isArray(data) ? data : [])
    } catch (e) {
      setRecords([])
      setError(e instanceof Error ? e.message : 'Error al cargar registros')
    } finally {
      setLoading(false)
    }
  }, [token, appliedFilters])

  const fetchLogbooks = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      const data = await apiFetch<LogbookDTO[]>(LOGBOOKS_API)

      setLogbooks(Array.isArray(data) ? data : [])
    } catch {
      setLogbooks([])
    }
  }, [token])

  useEffect(() => {
    void fetchLogbooks()
  }, [fetchLogbooks])

  useEffect(() => {
    void fetchRecords()
  }, [fetchRecords])

  const filteredRecords = useMemo(() => {
    return records.filter(r => recordMatchesSearch(r, search))
  }, [records, search])

  const paginatedRecords = useMemo(() => {
    const start = page * rowsPerPage

    
return filteredRecords.slice(start, start + rowsPerPage)
  }, [filteredRecords, page, rowsPerPage])

  useEffect(() => {
    setPage(0)
  }, [search])

  const handleSearchFilters = useCallback(() => {
    setPage(0)
    setAppliedFilters({
      type: filterType,
      status: filterStatus,
      fromDate: filterFromDate,
      toDate: filterToDate
    })
  }, [filterFromDate, filterStatus, filterToDate, filterType])

  const handleOpenDialog = useCallback(() => {
    setFormError(null)
    setFormType('High')
    setFormWeight('')
    setFormPreparationTime('')
    setFormObservation('')

    if (logbooks.length === 1) {
      setFormLogbookId(String(logbooks[0].id))
    } else {
      setFormLogbookId('')
    }

    setDialogOpen(true)
  }, [logbooks])

  const handleCloseDialog = useCallback(() => {
    if (submitting) {
      return
    }

    setFormType('')
    setFormWeight('')
    setFormLogbookId('')
    setFormObservation('')
    setFormPreparationTime('')
    setFormError(null)
    setDialogOpen(false)
  }, [submitting])

  const handleCreate = useCallback(async () => {
    setFormError(null)

    if (formType !== 'High' && formType !== 'Low') {
      setFormError('Debes seleccionar el tipo.')

      return
    }

    const weightNum = parseFloat(formWeight)

    if (!formWeight || Number.isNaN(weightNum) || weightNum <= 0) {
      setFormError('El peso debe ser un número mayor a cero.')

      return
    }

    if (!formLogbookId) {
      setFormError('Debes seleccionar una bitácora.')

      return
    }

    setSubmitting(true)

    try {
      const body: CreateConductivityRequest = {
        type: formType,
        weightGrams: weightNum,
        preparationTime: formPreparationTime.trim() || null,
        observation: formObservation.trim() || null,
        logbookId: Number(formLogbookId)
      }

      await apiFetch<ConductivityRecord>(CONDUCTIVITY_API, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      setFormError(null)
      setDialogOpen(false)
      setSnackbarSeverity('success')
      setSnackbar('Registro creado correctamente')
      void fetchRecords()
    } catch (e) {
      setSnackbarSeverity('error')
      setSnackbar(e instanceof Error ? e.message : 'Error al crear registro')
    } finally {
      setSubmitting(false)
    }
  }, [
    fetchRecords,
    formLogbookId,
    formObservation,
    formPreparationTime,
    formType,
    formWeight
  ])

  const handleDownloadPdf = useCallback(async (id: number) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/conductivity-records/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (!res.ok) {
        let msg = ''

        try {
          const errJson = (await res.json()) as { message?: string; error?: string }

          msg = errJson.message || errJson.error || ''
        } catch {
          /* ignore */
        }

        setSnackbarSeverity('error')
        setSnackbar(msg || getHttpErrorMessage(res.status))

        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      a.download = `conductividad-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setSnackbarSeverity('success')
      setSnackbar('PDF descargado')
    } catch (e) {
      setSnackbarSeverity('error')
      setSnackbar(e instanceof Error ? e.message : 'Error al descargar PDF')
    }
  }, [token])

  const handleReview = useCallback(
    async (id: number) => {
      setReviewing(id)
      setReviewSubmitting(true)

      try {
        await apiFetch<ConductivityRecord>(`${CONDUCTIVITY_API}/${id}/review`, {
          method: 'POST',
          body: JSON.stringify({})
        })
        setSnackbarSeverity('success')
        setSnackbar('Registro revisado correctamente')
        setConfirmReviewOpen(false)
        setReviewingId(null)
        void fetchRecords()
      } catch (e) {
        setSnackbarSeverity('error')
        setSnackbar(e instanceof Error ? e.message : 'Error al revisar')
      } finally {
        setReviewSubmitting(false)
        setReviewing(null)
      }
    },
    [fetchRecords]
  )

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const weightNumPreview = parseFloat(formWeight)

  const formValid =
    (formType === 'High' || formType === 'Low') &&
    formLogbookId !== '' &&
    formWeight.trim() !== '' &&
    !Number.isNaN(weightNumPreview) &&
    weightNumPreview > 0

  return (
    <>
      <Card variant='outlined'>
        <CardHeader title='Registros de conductividad' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1} alignItems='center'>
              <TextField
                size='small'
                placeholder='Buscar en tabla…'
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 220 }, flex: '1 1 180px' }}
                inputProps={{ 'aria-label': 'Buscar en tabla de conductividad' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Box component='i' className='ri-search-line' sx={{ fontSize: 18, opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                  ...(search
                    ? {
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton size='small' onClick={() => setSearch('')} aria-label='Limpiar búsqueda'>
                              <Box component='i' className='ri-close-line' sx={{ fontSize: 16 }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    : {})
                }}
              />
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel id='filter-type-label'>Tipo</InputLabel>
                <Select
                  labelId='filter-type-label'
                  label='Tipo'
                  value={filterType}
                  onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
                >
                  <MenuItem value=''>Todos</MenuItem>
                  <MenuItem value='High'>Alta</MenuItem>
                  <MenuItem value='Low'>Baja</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel id='filter-status-label'>Estado</InputLabel>
                <Select
                  labelId='filter-status-label'
                  label='Estado'
                  value={filterStatus}
                  onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value=''>Todos</MenuItem>
                  <MenuItem value='Draft'>Borrador</MenuItem>
                  <MenuItem value='Signed'>Firmado</MenuItem>
                  <MenuItem value='Locked'>Aprobado</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size='small'
                type='date'
                label='Desde'
                InputLabelProps={{ shrink: true }}
                value={filterFromDate}
                onChange={e => setFilterFromDate(e.target.value)}
                sx={{ width: 150 }}
              />
              <TextField
                size='small'
                type='date'
                label='Hasta'
                InputLabelProps={{ shrink: true }}
                value={filterToDate}
                onChange={e => setFilterToDate(e.target.value)}
                sx={{ width: 150 }}
              />
              <Button variant='outlined' startIcon={<Box component='i' className='ri-filter-3-line' />} onClick={handleSearchFilters}>
                Buscar
              </Button>
              <Tooltip
                title='Registra una medición de conductividad KCl. Solo necesitas seleccionar el tipo (Alta o Baja) e ingresar el peso en gramos. El sistema calcula automáticamente la conductividad y verifica si está en rango.'
                arrow
                placement='left'
              >
                <span>
                  <Button
                    variant='contained'
                    startIcon={<Box component='i' className='ri-add-line' />}
                    onClick={handleOpenDialog}
                    disabled={!token}
                  >
                    Nuevo registro
                  </Button>
                </span>
              </Tooltip>
            </Stack>
            <Typography variant='body2' color='text.secondary'>
              {search.trim()
                ? `${filteredRecords.length} de ${records.length} registro${records.length === 1 ? '' : 's'}`
                : `${records.length} registro${records.length === 1 ? '' : 's'}`}
            </Typography>
          </Stack>

          {error ? (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {!loading && !error ? (
            <>
              {records.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  No hay registros.
                </Typography>
              ) : filteredRecords.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  No hay coincidencias con la búsqueda.
                </Typography>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: 440, overflow: 'auto' }}>
                    <Table size='small' stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 48 }}>#</TableCell>
                          <TableCell>Folio</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Peso (g)</TableCell>
                          <TableCell>Conductividad (µS/cm)</TableCell>
                          <TableCell>¿En rango?</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Creado por</TableCell>
                          <TableCell>Revisor</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell align='center'>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedRecords.map((row, index) => {
                          const createdLabel =
                            row.createdByName?.trim() ||
                            (row.createdByNomenclature ? row.createdByNomenclature : '—')

                          
return (
                            <TableRow key={row.conductivityId} hover>
                              <TableCell sx={{ color: 'text.secondary' }}>
                                {page * rowsPerPage + index + 1}
                              </TableCell>
                              <TableCell>{row.displayFolio ?? '—'}</TableCell>
                              <TableCell>{typeLabel(row.type)}</TableCell>
                              <TableCell>{formatWeight(row.weightGrams)}</TableCell>
                              <TableCell>{formatConductivityZero(row.calculatedValue)}</TableCell>
                              <TableCell>{inRangeChip(row.inRange)}</TableCell>
                              <TableCell>{statusChip(row.status)}</TableCell>
                              <TableCell>{createdLabel}</TableCell>
                              <TableCell>{row.reviewerName ?? '—'}</TableCell>
                              <TableCell>{formatDateDdMmYyyy(row.recordedAt)}</TableCell>
                              <TableCell align='center'>
                                <Stack direction='row' spacing={0.5} justifyContent='center'>
                                  <Tooltip title='Descargar PDF'>
                                    <IconButton
                                      size='small'
                                      aria-label='PDF'
                                      onClick={() => void handleDownloadPdf(row.conductivityId)}
                                    >
                                      <Box component='i' className='ri-file-pdf-line' />
                                    </IconButton>
                                  </Tooltip>
                                  {row.status !== 'Locked' ? (
                                    <Tooltip title='Revisar / aprobar'>
                                      <span>
                                        <IconButton
                                          size='small'
                                          color='primary'
                                          aria-label='Revisar'
                                          disabled={reviewing === row.conductivityId}
                                          onClick={() => {
                                            setReviewingId(row.conductivityId)
                                            setConfirmReviewOpen(true)
                                          }}
                                        >
                                          <Box component='i' className='ri-check-double-line' />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  ) : null}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component='div'
                    count={filteredRecords.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage='Filas por página:'
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                  />
                </>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth='sm' PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>Nuevo registro</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required size='small'>
              <InputLabel id='form-type-label'>Tipo</InputLabel>
              <Select<ConductivityType | ''>
                labelId='form-type-label'
                label='Tipo'
                displayEmpty
                value={formType}
                onChange={(e: SelectChangeEvent<ConductivityType | ''>) => {
                  setFormError(null)
                  setFormType(e.target.value as ConductivityType | '')
                }}
              >
                <MenuItem value=''>
                  <em>Seleccionar…</em>
                </MenuItem>
                <MenuItem value='High'>Alta</MenuItem>
                <MenuItem value='Low'>Baja</MenuItem>
              </Select>
            </FormControl>
            <TextField
              required
              fullWidth
              size='small'
              type='number'
              label='Peso (g)'
              value={formWeight}
              onChange={e => {
                setFormError(null)
                setFormWeight(e.target.value)
              }}
              inputProps={{ step: 0.0001, min: 0 }}
            />
            <FormControl fullWidth required size='small'>
              <InputLabel id='form-logbook-label'>Bitácora</InputLabel>
              <Select
                labelId='form-logbook-label'
                label='Bitácora'
                value={formLogbookId}
                onChange={(e: SelectChangeEvent) => {
                  setFormError(null)
                  setFormLogbookId(e.target.value)
                }}
              >
                {logbooks.length === 0 ? (
                  <MenuItem value='' disabled>
                    No hay bitácoras disponibles
                  </MenuItem>
                ) : null}
                {logbooks.map(lb => (
                  <MenuItem key={lb.id} value={String(lb.id)}>
                    {lb.name} (ID {lb.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size='small'
              type='time'
              label='Hora de preparación'
              InputLabelProps={{ shrink: true }}
              value={formPreparationTime}
              onChange={e => setFormPreparationTime(e.target.value)}
            />
            <TextField
              fullWidth
              size='small'
              label='Observaciones'
              multiline
              rows={2}
              value={formObservation}
              onChange={e => setFormObservation(e.target.value)}
            />
            {formType ? (
              <Alert severity='info' sx={{ mb: 2, fontSize: '0.82rem' }}>
                <strong>¿Cómo funciona?</strong>
                <br />
                1. Ingresa el peso en gramos del KCl pesado.
                <br />
                2. El sistema calcula automáticamente la conductividad teórica (µS/cm).
                <br />
                3. Se verifica si el resultado está en el rango de aceptación (~1400–1420 µS/cm).
                <br />
                <br />
                <strong>Fórmula ({formType === 'High' ? 'Alta' : 'Baja'}):</strong>{' '}
                mol = peso × F24 / C26 → conductividad = mol × F28 / D28 (µS/cm)
              </Alert>
            ) : (
              <Alert severity='info' sx={{ mb: 2, fontSize: '0.82rem' }}>
                Selecciona el tipo de conductividad para ver la fórmula aplicada.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        {formError ? (
          <Box sx={{ px: 3, pt: 0, pb: 1 }}>
            <Alert severity='error' onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          </Box>
        ) : null}
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 3, py: 2 }}>
          <Button variant='outlined' onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={() => void handleCreate()} disabled={!formValid || submitting}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmReviewOpen}
        onClose={() => {
          if (reviewSubmitting) {
            return
          }

          setConfirmReviewOpen(false)
          setReviewingId(null)
        }}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Confirmar revisión</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas aprobar este registro de conductividad? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmReviewOpen(false)
              setReviewingId(null)
            }}
            disabled={reviewSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='success'
            disabled={reviewSubmitting || reviewingId == null}
            startIcon={
              reviewSubmitting ? <CircularProgress size={16} color='inherit' /> : null
            }
            onClick={() => {
              if (reviewingId != null) {
                void handleReview(reviewingId)
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar != null}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbar ?? ''}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ConductivityPanel
