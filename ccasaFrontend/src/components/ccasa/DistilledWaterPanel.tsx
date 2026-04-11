'use client'

// React Imports
import type { FormEvent, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
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
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch, getApiBaseUrl, getErrorMessage, getHttpErrorMessage, PDF_DOWNLOAD_ERROR } from '@/lib/ccasa/api'
import { clearCcasaClientSession } from '@/lib/ccasa/clientSession'
import { ENTRY_STATUS_LABELS, getSectionInfo } from '@/lib/ccasa/crudDisplay'
import { formatDateDdMmYyyy } from '@/lib/ccasa/formatters'
import type {
  CrudResponseDTO,
  DistilledWaterRequestDTO,
  DistilledWaterResponseDTO,
  LogbookDTO
} from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const EMPTY_FORM: Record<string, string> = {
  folioId: '',
  logbookId: '',
  userId: '',
  phReading1: '',
  phReading2: '',
  phReading3: '',
  ceReading1: '',
  ceReading2: '',
  ceReading3: '',
  referenceDifference: '',
  controlStandardPct: '',
  waterBatchId: '',
  samplerUserId: ''
}

type Option = { value: number; label: string }

function buildEntrySearchLabel(item: CrudResponseDTO, logbookNameById: Map<number, string>): string {
  const v = item.values ?? {}
  const logbookId = v.logbookId != null ? Number(v.logbookId) : NaN
  const logbookName = Number.isFinite(logbookId) ? logbookNameById.get(logbookId) : undefined
  const statusRaw = typeof v.status === 'string' ? v.status : ''
  const statusLabel = statusRaw ? (ENTRY_STATUS_LABELS[statusRaw] ?? statusRaw) : ''
  const ra = v.recordedAt
  const recordedStr = ra != null && ra !== '' ? formatDateDdMmYyyy(typeof ra === 'string' ? ra : String(ra)) : ''
  const datePart = recordedStr && recordedStr !== '—' ? ` (${recordedStr})` : ''

  let label = `Entrada #${item.id}`

  if (logbookName) {
    label += ` — ${logbookName}`
  }

  if (statusLabel) {
    label += ` — ${statusLabel}`
  }

  label += datePart

  return label
}

function formatCell(value: number | string | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  return String(value)
}

function formatEntryStatus(status: string | null | undefined): string {
  if (status == null || status === '') {
    return '—'
  }

  return ENTRY_STATUS_LABELS[status] ?? 'Desconocido'
}

/** true si el error parece 403 / permisos (p. ej. listar usuarios sin rol adecuado). */
function isSamplerOptionsPermissionError(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false
  }

  const msg = err.message.toLowerCase()

  return (
    msg.includes('403') ||
    msg.includes('access denied') ||
    msg.includes('access_denied') ||
    msg.includes('denied') ||
    msg.includes('forbidden') ||
    msg.includes('acceso') ||
    msg.includes('permiso') ||
    msg.includes('no tienes permiso') ||
    msg.includes('unauthorized')
  )
}

function mapCrudUsersToOptions(rows: CrudResponseDTO[]): Option[] {
  return rows.map(r => ({
    value: r.id,
    label: [r.values?.firstName, r.values?.lastName].filter(Boolean).join(' ') || String(r.id)
  }))
}

function acceptableValueCell(v: boolean | null): ReactNode {
  if (v === true) {
    return <Chip label='Sí' color='success' size='small' />
  }

  if (v === false) {
    return <Chip label='No' color='error' size='small' />
  }

  return <span>—</span>
}

function responseToTableRows(d: DistilledWaterResponseDTO): { label: string; value: ReactNode }[] {
  return [
    { label: 'Entrada', value: formatCell(d.entryId) },
    { label: 'Bitácora', value: formatCell(d.logbookName) },
    { label: 'Analista (entrada)', value: formatCell(d.analystName) },
    { label: 'Muestreador', value: formatCell(d.samplerName?.trim() ? d.samplerName : null) },
    { label: 'Folio', value: formatCell(d.folio) },
    { label: 'Fecha registro', value: formatCell(d.recordedAt) },
    { label: 'ID registro', value: formatCell(d.distilledWaterEntryId) },
    { label: 'pH Lectura 1', value: formatCell(d.phReading1) },
    { label: 'pH Lectura 2', value: formatCell(d.phReading2) },
    { label: 'pH Lectura 3', value: formatCell(d.phReading3) },
    { label: 'pH Promedio', value: formatCell(d.phAverage) },
    { label: 'CE Lectura 1', value: formatCell(d.ceReading1) },
    { label: 'CE Lectura 2', value: formatCell(d.ceReading2) },
    { label: 'CE Lectura 3', value: formatCell(d.ceReading3) },
    { label: 'CE Promedio', value: formatCell(d.ceAverage) },
    { label: 'Diferencia referencia', value: formatCell(d.referenceDifference) },
    { label: 'Estándar control %', value: formatCell(d.controlStandardPct) },
    { label: '¿Aceptable?', value: acceptableValueCell(d.isAcceptable) },
    { label: 'Lote de agua', value: formatCell(d.waterBatchId) },
    { label: 'Estado', value: formatEntryStatus(d.entryStatus) }
  ]
}

/** Parsea número opcional; admite coma decimal (es-ES) y espacios. */
function parseOptionalNumber(raw: string): number | undefined {
  const t = raw.trim().replace(/\s/g, '').replace(',', '.')

  if (t === '') {
    return undefined
  }

  const n = Number(t)

  return Number.isFinite(n) ? n : undefined
}

function buildCreateDto(form: Record<string, string>): { ok: true; dto: DistilledWaterRequestDTO } | { ok: false; message: string } {
  const folioId = Number(form.folioId?.trim())
  const logbookId = Number(form.logbookId?.trim())
  const userId = Number(form.userId?.trim())

  if (!form.folioId?.trim() || !Number.isFinite(folioId)) {
    return { ok: false, message: 'Selecciona un folio.' }
  }

  if (!form.logbookId?.trim() || !Number.isFinite(logbookId)) {
    return { ok: false, message: 'Selecciona una bitácora.' }
  }

  if (!form.userId?.trim() || !Number.isFinite(userId)) {
    return { ok: false, message: 'Selecciona un usuario.' }
  }

  const phParsed = [form.phReading1, form.phReading2, form.phReading3].map(v => parseOptionalNumber(v ?? ''))
  const phFilled = phParsed.filter(v => v !== undefined).length

  if (phFilled > 0 && phFilled < 3) {
    return { ok: false, message: 'Ingresa las tres lecturas de pH (1, 2 y 3) o deja todas vacías.' }
  }

  const ceParsed = [form.ceReading1, form.ceReading2, form.ceReading3].map(v => parseOptionalNumber(v ?? ''))
  const ceFilled = ceParsed.filter(v => v !== undefined).length

  if (ceFilled > 0 && ceFilled < 3) {
    return { ok: false, message: 'Ingresa las tres lecturas de CE (1, 2 y 3) o deja todas vacías.' }
  }

  const dto: DistilledWaterRequestDTO = { folioId, logbookId, userId }

  const ph1 = parseOptionalNumber(form.phReading1 ?? '')

  if (ph1 !== undefined) dto.phReading1 = ph1
  const ph2 = parseOptionalNumber(form.phReading2 ?? '')

  if (ph2 !== undefined) dto.phReading2 = ph2
  const ph3 = parseOptionalNumber(form.phReading3 ?? '')

  if (ph3 !== undefined) dto.phReading3 = ph3

  const ce1 = parseOptionalNumber(form.ceReading1 ?? '')

  if (ce1 !== undefined) dto.ceReading1 = ce1
  const ce2 = parseOptionalNumber(form.ceReading2 ?? '')

  if (ce2 !== undefined) dto.ceReading2 = ce2
  const ce3 = parseOptionalNumber(form.ceReading3 ?? '')

  if (ce3 !== undefined) dto.ceReading3 = ce3

  const refDiff = parseOptionalNumber(form.referenceDifference ?? '')

  if (refDiff !== undefined) dto.referenceDifference = refDiff
  const ctrl = parseOptionalNumber(form.controlStandardPct ?? '')

  if (ctrl !== undefined) dto.controlStandardPct = ctrl
  const batch = parseOptionalNumber(form.waterBatchId ?? '')

  if (batch !== undefined) dto.waterBatchId = batch

  const samplerUserId = parseOptionalNumber(form.samplerUserId ?? '')

  if (samplerUserId !== undefined) dto.samplerUserId = samplerUserId

  return { ok: true, dto }
}

function DistilledWaterResultTable({ data }: { data: DistilledWaterResponseDTO }) {
  const rows = responseToTableRows(data)

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size='small'>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.label}>
              <TableCell component='th' scope='row' sx={{ fontWeight: 600, width: '40%' }}>
                {row.label}
              </TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const DistilledWaterPanel = () => {
  const { token, hydrated } = useAuth()

  const [searchId, setSearchId] = useState('')
  const [entryOptions, setEntryOptions] = useState<Option[]>([])
  const [result, setResult] = useState<DistilledWaterResponseDTO | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [folioOptions, setFolioOptions] = useState<Option[]>([])
  const [logbookOptions, setLogbookOptions] = useState<Option[]>([])
  const [userOptions, setUserOptions] = useState<Option[]>([])
  const [samplerUserOptions, setSamplerUserOptions] = useState<Option[]>([])
  const [batchOptions, setBatchOptions] = useState<Option[]>([])

  const [formState, setFormState] = useState<Record<string, string>>(() => ({ ...EMPTY_FORM }))

  /** Siempre el último formulario; evita cierres obsoletos en submit si el callback no coincidía con el render actual. */
  const formStateRef = useRef(formState)

  formStateRef.current = formState

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createResult, setCreateResult] = useState<DistilledWaterResponseDTO | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [entryListsReady, setEntryListsReady] = useState(false)

  useEffect(() => {
    if (!token) {
      setFolioOptions([])
      setLogbookOptions([])
      setUserOptions([])
      setSamplerUserOptions([])
      setBatchOptions([])
      setEntryOptions([])
      setEntryListsReady(false)

      return
    }

    setEntryListsReady(false)
    const opts = { token }

    void Promise.all([
      apiFetch<CrudResponseDTO[]>('/api/v1/folios', opts).then(rows =>
        setFolioOptions(
          (Array.isArray(rows) ? rows : []).map(item => ({
            value: item.id,
            label: `Folio ${item.values?.folioNumber ?? item.id}`
          }))
        )
      ),
      apiFetch<LogbookDTO[]>('/api/v1/logbooks', opts).then(async rows => {
        const lbArr = Array.isArray(rows) ? rows : []

        setLogbookOptions(
          lbArr.map(item => ({
            value: item.id,
            label: item.name ?? `#${item.id}`
          }))
        )

        const logbookNameById = new Map(lbArr.map(l => [l.id, (l.name ?? '').trim() || `#${l.id}`]))

        try {
          const entRows = await apiFetch<CrudResponseDTO[]>('/api/v1/entries', opts)

          setEntryOptions(
            (Array.isArray(entRows) ? entRows : []).map(item => ({
              value: item.id,
              label: buildEntrySearchLabel(item, logbookNameById)
            }))
          )
        } catch {
          setEntryOptions([])
        }
      }),
      apiFetch<CrudResponseDTO | CrudResponseDTO[]>('/api/v1/users/me', opts).then(data => {
        const rows = Array.isArray(data) ? data : data != null ? [data] : []

        setUserOptions(
          rows.map(r => ({
            value: r.id,
            label:
              [r.values?.firstName, r.values?.lastName].filter(Boolean).join(' ') || String(r.id)
          }))
        )
      }),
      (async () => {
        try {
          const rows = await apiFetch<CrudResponseDTO[]>('/api/v1/users', opts)

          setSamplerUserOptions(mapCrudUsersToOptions(Array.isArray(rows) ? rows : []))
        } catch (e) {
          if (isSamplerOptionsPermissionError(e)) {
            try {
              const data = await apiFetch<CrudResponseDTO | CrudResponseDTO[]>('/api/v1/users/me', opts)
              const arr = Array.isArray(data) ? data : data != null ? [data] : []

              setSamplerUserOptions(mapCrudUsersToOptions(arr))
            } catch {
              setSamplerUserOptions([])
            }
          } else {
            setSamplerUserOptions([])
          }
        }
      })(),
      apiFetch<CrudResponseDTO[]>('/api/v1/batches', opts).then(rows =>
        setBatchOptions(
          (Array.isArray(rows) ? rows : []).map(item => ({
            value: item.id,
            label: String(item.values?.batchCode ?? `#${item.id}`)
          }))
        )
      ),
    ])
      .catch(() => {
        setFolioOptions([])
        setLogbookOptions([])
        setUserOptions([])
        setSamplerUserOptions([])
        setBatchOptions([])
        setEntryOptions([])
      })
      .finally(() => {
        setEntryListsReady(true)
      })
  }, [token])

  const handleSearch = useCallback(async () => {
    if (!token) {
      return
    }

    setSearchError(null)
    const id = searchId.trim()

    if (!id) {
      setSearchError('Selecciona una entrada.')
      setResult(null)

      return
    }

    if (!Number.isFinite(Number(id))) {
      setSearchError('La entrada seleccionada no es válida.')
      setResult(null)

      return
    }

    setSearching(true)
    setResult(null)

    try {
      const url = `${getApiBaseUrl()}/api/v1/entries/${encodeURIComponent(id)}/distilled-water`

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })

      if (res.status === 401) {
        clearCcasaClientSession()

        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true'
        }

        return
      }

      if (res.status === 404) {
        setSearchError('Esta entrada no tiene registro de agua destilada. Crea uno nuevo.')

        return
      }

      if (!res.ok) {
        let msg = ''

        try {
          const errJson = (await res.json()) as { message?: string; error?: string }

          msg = errJson.message || errJson.error || ''
        } catch {
          /* ignore */
        }

        setSearchError(msg || getHttpErrorMessage(res.status))

        return
      }

      const text = await res.text()
      const data = text ? (JSON.parse(text) as DistilledWaterResponseDTO) : null

      if (data == null || (typeof data === 'object' && Object.keys(data as object).length === 0)) {
        setSearchError('Esta entrada no tiene registro de agua destilada. Crea uno nuevo.')

        return
      }

      setResult(data)
    } catch (e) {
      setResult(null)
      setSearchError(getErrorMessage(e, 'Error al consultar'))
    } finally {
      setSearching(false)
    }
  }, [token, searchId])

  const handleDownloadPdf = useCallback(
    async (entryId: number) => {
      if (!token) {
        return
      }

      setDownloadingPdf(true)

      try {
        const res = await fetch(
          `${getApiBaseUrl()}/api/v1/entries/${encodeURIComponent(String(entryId))}/distilled-water/pdf`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!res.ok) {
          let msg = ''

          try {
            const errJson = (await res.json()) as { message?: string; error?: string }

            msg = errJson.message || errJson.error || ''
          } catch {
            /* ignore */
          }

          setSnackbarSeverity('error')
          setSnackbarMessage(msg || getHttpErrorMessage(res.status))
          setSnackbarOpen(true)

          return
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')

        a.href = url
        a.download = `agua-destilada-${entryId}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        setSnackbarSeverity('success')
        setSnackbarMessage('PDF de agua destilada descargado correctamente')
        setSnackbarOpen(true)
      } catch (e) {
        setSnackbarSeverity('error')
        setSnackbarMessage(getErrorMessage(e, PDF_DOWNLOAD_ERROR))
        setSnackbarOpen(true)
      } finally {
        setDownloadingPdf(false)
      }
    },
    [token]
  )

  const handleCreateSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!token) {
        return
      }

      setCreateError(null)
      setCreateSuccess(false)

      const built = buildCreateDto(formStateRef.current)

      if (!built.ok) {
        setCreateError(built.message)

        return
      }

      setCreating(true)

      try {
        const data = await apiFetch<DistilledWaterResponseDTO>('/api/v1/entries/distilled-water', {
          method: 'POST',
          body: JSON.stringify(built.dto),
          token
        })

        setCreateResult(data)
        setCreateSuccess(true)
        setFormState({ ...EMPTY_FORM })
        setSnackbarSeverity('success')
        setSnackbarMessage('Registro de agua destilada creado correctamente. Puedes descargar el PDF.')
        setSnackbarOpen(true)
      } catch (err) {
        setCreateError(getErrorMessage(err, 'Error al crear la entrada'))
      } finally {
        setCreating(false)
      }
    },
    [token]
  )

  const noToken = hydrated && !token

  const selectNumberValue = (raw: string): number | '' => {
    if (raw === '') {
      return ''
    }

    const n = Number(raw)

    return Number.isFinite(n) ? n : ''
  }

  const onFolioChange = (ev: SelectChangeEvent<number | ''>) => {
    const v = ev.target.value

    setFormState(prev => ({ ...prev, folioId: v === '' ? '' : String(v) }))
  }

  const onLogbookChange = (ev: SelectChangeEvent<number | ''>) => {
    const v = ev.target.value

    setFormState(prev => ({ ...prev, logbookId: v === '' ? '' : String(v) }))
  }

  const onUserChange = (ev: SelectChangeEvent<number | ''>) => {
    const v = ev.target.value

    setFormState(prev => ({ ...prev, userId: v === '' ? '' : String(v) }))
  }

  const onBatchChange = (ev: SelectChangeEvent<number | ''>) => {
    const v = ev.target.value

    setFormState(prev => ({ ...prev, waterBatchId: v === '' ? '' : String(v) }))
  }

  const onSamplerUserChange = (ev: SelectChangeEvent<number | ''>) => {
    const v = ev.target.value

    setFormState(prev => ({ ...prev, samplerUserId: v === '' ? '' : String(v) }))
  }

  const onSearchEntryChange = (ev: SelectChangeEvent<number | ''>) => {
    const v = ev.target.value

    setSearchId(v === '' ? '' : String(v))
  }

  const distilledWaterSectionInfo = getSectionInfo('/api/v1/entry-distilled-water')

  return (
    <Stack spacing={4}>
      {noToken ? (
        <Alert severity='warning'>Inicia sesión para consultar y crear entradas de agua destilada.</Alert>
      ) : null}

      <Card variant='outlined'>
        <CardHeader title='Consultar agua destilada por entrada' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Stack spacing={2}>
            <Alert severity='info' variant='outlined' sx={{ mb: 2, fontSize: '0.82rem' }}>
              Consulta el registro de agua destilada de una entrada existente. Si la entrada no tiene registro, puedes
              crearlo en la sección de abajo.
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <FormControl size='small' sx={{ minWidth: 220 }} disabled={!token || searching}>
                <InputLabel id='distilled-search-entry-label' shrink>
                  Entrada
                </InputLabel>
                <Select
                  labelId='distilled-search-entry-label'
                  label='Entrada'
                  notched
                  value={selectNumberValue(searchId)}
                  onChange={onSearchEntryChange}
                  displayEmpty
                >
                  <MenuItem value=''>
                    <em>Seleccionar…</em>
                  </MenuItem>
                  {entryOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant='contained' onClick={() => void handleSearch()} disabled={!token || searching}>
                Consultar
              </Button>
              {result ? (
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    setResult(null)
                    setSearchId('')
                    setSearchError(null)
                  }}
                >
                  Limpiar
                </Button>
              ) : null}
              {searching ? <CircularProgress size={24} /> : null}
            </Stack>

            {token && entryListsReady && !searching && entryOptions.length === 0 ? (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1, fontSize: '0.82rem' }}>
                No hay entradas disponibles. Crea una entrada en el módulo de Entradas → Núcleo.
              </Typography>
            ) : null}

            {searchError ? <Alert severity='error'>{searchError}</Alert> : null}

            {!searching && result ? (
              <Stack spacing={1}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Tooltip title='Exportar PDF de agua destilada' arrow>
                    <span>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => void handleDownloadPdf(result.entryId)}
                        disabled={!token || downloadingPdf}
                        aria-label='Exportar PDF de agua destilada'
                      >
                        {downloadingPdf ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Box component='i' className='ri-file-pdf-line' />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <DistilledWaterResultTable data={result} />
              </Stack>
            ) : null}

            {!searching && !searchError && !result && entryOptions.length > 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Selecciona una entrada para consultar
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardHeader title='Nueva entrada de agua destilada' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          {distilledWaterSectionInfo ? (
            <Alert severity='info' variant='outlined' sx={{ mb: 2, fontSize: '0.82rem' }}>
              {distilledWaterSectionInfo}
            </Alert>
          ) : null}
          <Box component='form' onSubmit={handleCreateSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size='small' required disabled={!token || creating}>
                  <InputLabel id='dw-folio-label' shrink>
                    Folio
                  </InputLabel>
                  <Select
                    labelId='dw-folio-label'
                    label='Folio'
                    notched
                    value={selectNumberValue(formState.folioId ?? '')}
                    onChange={onFolioChange}
                    displayEmpty
                  >
                    <MenuItem value=''>
                      <em>Seleccionar…</em>
                    </MenuItem>
                    {folioOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size='small' required disabled={!token || creating}>
                  <InputLabel id='dw-logbook-label' shrink>
                    Bitácora
                  </InputLabel>
                  <Select
                    labelId='dw-logbook-label'
                    label='Bitácora'
                    notched
                    value={selectNumberValue(formState.logbookId ?? '')}
                    onChange={onLogbookChange}
                    displayEmpty
                  >
                    <MenuItem value=''>
                      <em>Seleccionar…</em>
                    </MenuItem>
                    {logbookOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size='small' required disabled={!token || creating}>
                  <InputLabel id='dw-user-label' shrink>
                    Usuario
                  </InputLabel>
                  <Select
                    labelId='dw-user-label'
                    label='Usuario'
                    notched
                    value={selectNumberValue(formState.userId ?? '')}
                    onChange={onUserChange}
                    displayEmpty
                  >
                    <MenuItem value=''>
                      <em>Seleccionar…</em>
                    </MenuItem>
                    {userOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size='small' disabled={!token || creating}>
                  <InputLabel id='dw-sampler-label' shrink>
                    Muestreador (opcional)
                  </InputLabel>
                  <Select
                    labelId='dw-sampler-label'
                    label='Muestreador (opcional)'
                    notched
                    value={selectNumberValue(formState.samplerUserId ?? '')}
                    onChange={onSamplerUserChange}
                    displayEmpty
                  >
                    <MenuItem value=''>
                      <em>— Ninguno —</em>
                    </MenuItem>
                    {samplerUserOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: 'text.secondary'
                  }}
                >
                  Lecturas de pH
                </Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='pH Lectura 1'
                  name='phReading1'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.phReading1 ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, phReading1: ev.target.value }))}
                  disabled={!token || creating}
                  helperText='Valor típico entre 0 y 14'
                  inputProps={{ inputMode: 'decimal', step: 0.001 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='pH Lectura 2'
                  name='phReading2'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.phReading2 ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, phReading2: ev.target.value }))}
                  disabled={!token || creating}
                  helperText='Valor típico entre 0 y 14'
                  inputProps={{ inputMode: 'decimal', step: 0.001 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='pH Lectura 3'
                  name='phReading3'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.phReading3 ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, phReading3: ev.target.value }))}
                  disabled={!token || creating}
                  helperText='Valor típico entre 0 y 14'
                  inputProps={{ inputMode: 'decimal', step: 0.001 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: 'text.secondary'
                  }}
                >
                  Lecturas de CE (µS/cm)
                </Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='CE Lectura 1'
                  name='ceReading1'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.ceReading1 ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, ceReading1: ev.target.value }))}
                  disabled={!token || creating}
                  helperText='Valor en µS/cm'
                  inputProps={{ inputMode: 'decimal', step: 0.0001 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='CE Lectura 2'
                  name='ceReading2'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.ceReading2 ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, ceReading2: ev.target.value }))}
                  disabled={!token || creating}
                  helperText='Valor en µS/cm'
                  inputProps={{ inputMode: 'decimal', step: 0.0001 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label='CE Lectura 3'
                  name='ceReading3'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.ceReading3 ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, ceReading3: ev.target.value }))}
                  disabled={!token || creating}
                  helperText='Valor en µS/cm'
                  inputProps={{ inputMode: 'decimal', step: 0.0001 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: 'text.secondary'
                  }}
                >
                  Control de calidad
                </Typography>
                <Divider sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Diferencia referencia'
                  name='referenceDifference'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.referenceDifference ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, referenceDifference: ev.target.value }))}
                  disabled={!token || creating}
                  inputProps={{ inputMode: 'decimal', step: 0.0001 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label='Estándar control %'
                  name='controlStandardPct'
                  type='text'
                  fullWidth
                  size='small'
                  value={formState.controlStandardPct ?? ''}
                  onChange={ev => setFormState(prev => ({ ...prev, controlStandardPct: ev.target.value }))}
                  disabled={!token || creating}
                  helperText='Valor porcentual'
                  inputProps={{ inputMode: 'decimal', step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size='small' disabled={!token || creating}>
                  <InputLabel id='dw-batch-label' shrink>
                    Lote de agua
                  </InputLabel>
                  <Select
                    labelId='dw-batch-label'
                    label='Lote de agua'
                    notched
                    value={selectNumberValue(formState.waterBatchId ?? '')}
                    onChange={onBatchChange}
                    displayEmpty
                  >
                    <MenuItem value=''>
                      <em>— Ninguno —</em>
                    </MenuItem>
                    {batchOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Alert severity='info' variant='outlined' sx={{ fontSize: '0.82rem' }}>
                  Ingresa las tres lecturas de pH y CE para que el sistema calcule los promedios automáticamente. Los
                  campos Lote de agua y Muestreador son opcionales; el muestreador aparece en el bloque ANALIZA del PDF
                  (RF-08).
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Button type='submit' variant='contained' disabled={!token || creating}>
                  Crear entrada
                </Button>
                <Button
                  type='button'
                  variant='outlined'
                  size='small'
                  sx={{ ml: 1 }}
                  onClick={() => {
                    setFormState({ ...EMPTY_FORM })
                    setCreateError(null)
                    setCreateSuccess(false)
                    setCreateResult(null)
                  }}
                  disabled={creating}
                >
                  Limpiar formulario
                </Button>
                {creating ? (
                  <CircularProgress size={24} sx={{ ml: 2, verticalAlign: 'middle' }} />
                ) : null}
              </Grid>
            </Grid>
          </Box>

          {createError ? (
            <Alert severity='error' sx={{ mt: 2 }}>
              {createError}
            </Alert>
          ) : null}

          {createSuccess && createResult ? (
            <Box sx={{ mt: 3 }}>
              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                <Typography variant='subtitle2'>Resultado</Typography>
                <Tooltip title='Exportar PDF de agua destilada' arrow>
                  <span>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => void handleDownloadPdf(createResult.entryId)}
                      disabled={!token || downloadingPdf}
                      aria-label='Exportar PDF de agua destilada'
                    >
                      {downloadingPdf ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Box component='i' className='ri-file-pdf-line' />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <DistilledWaterResultTable data={createResult} />
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbarSeverity}
          variant='filled'
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default DistilledWaterPanel
