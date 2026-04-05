'use client'

// React Imports
import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
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
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
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
  waterBatchId: ''
}

type FormFieldConfig = {
  key: keyof typeof EMPTY_FORM
  label: string
  required?: boolean
  md: number
}

const FORM_FIELDS: FormFieldConfig[] = [
  { key: 'phReading1', label: 'pH Lectura 1', md: 4 },
  { key: 'phReading2', label: 'pH Lectura 2', md: 4 },
  { key: 'phReading3', label: 'pH Lectura 3', md: 4 },
  { key: 'ceReading1', label: 'CE Lectura 1', md: 4 },
  { key: 'ceReading2', label: 'CE Lectura 2', md: 4 },
  { key: 'ceReading3', label: 'CE Lectura 3', md: 4 },
  { key: 'referenceDifference', label: 'Diferencia referencia', md: 6 },
  { key: 'controlStandardPct', label: 'Estándar control %', md: 6 }
]

type Option = { value: number; label: string }

function formatCell(value: number | string | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  return String(value)
}

function responseToTableRows(d: DistilledWaterResponseDTO): { label: string; value: string }[] {
  return [
    { label: 'Entrada', value: formatCell(d.entryId) },
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
    {
      label: '¿Aceptable?',
      value: d.isAcceptable === null ? '—' : d.isAcceptable ? 'Sí' : 'No'
    },
    { label: 'Lote de agua', value: formatCell(d.waterBatchId) },
    { label: 'Estado', value: formatCell(d.entryStatus) }
  ]
}

function parseOptionalNumber(raw: string): number | undefined {
  const t = raw.trim()

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

  return { ok: true, dto }
}

function DistilledWaterResultTable({ data }: { data: DistilledWaterResponseDTO }) {
  const rows = responseToTableRows(data)

  return (
    <TableContainer>
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
  const [batchOptions, setBatchOptions] = useState<Option[]>([])

  const [formState, setFormState] = useState<Record<string, string>>(() => ({ ...EMPTY_FORM }))
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createResult, setCreateResult] = useState<DistilledWaterResponseDTO | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      setFolioOptions([])
      setLogbookOptions([])
      setUserOptions([])
      setBatchOptions([])
      setEntryOptions([])

      return
    }

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
      apiFetch<LogbookDTO[]>('/api/v1/logbooks', opts).then(rows =>
        setLogbookOptions(
          (Array.isArray(rows) ? rows : []).map(item => ({
            value: item.id,
            label: item.name ?? `#${item.id}`
          }))
        )
      ),
      apiFetch<CrudResponseDTO[]>('/api/v1/users', opts).then(rows =>
        setUserOptions(
          (Array.isArray(rows) ? rows : []).map(item => {
            const name = `${item.values?.firstName ?? ''} ${item.values?.lastName ?? ''}`.trim()

            return {
              value: item.id,
              label: name || `#${item.id}`
            }
          })
        )
      ),
      apiFetch<CrudResponseDTO[]>('/api/v1/batches', opts).then(rows =>
        setBatchOptions(
          (Array.isArray(rows) ? rows : []).map(item => ({
            value: item.id,
            label: String(item.values?.batchCode ?? `#${item.id}`)
          }))
        )
      ),
      apiFetch<CrudResponseDTO[]>('/api/v1/entries', opts).then(rows =>
        setEntryOptions(
          (Array.isArray(rows) ? rows : []).map(item => ({
            value: item.id,
            label: `Entrada #${item.id}`
          }))
        )
      )
    ]).catch(() => {
      setFolioOptions([])
      setLogbookOptions([])
      setUserOptions([])
      setBatchOptions([])
      setEntryOptions([])
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
      const data = await apiFetch<DistilledWaterResponseDTO>(`/api/v1/entries/${encodeURIComponent(id)}/distilled-water`, {
        token
      })

      setResult(data)
    } catch (e) {
      setResult(null)
      setSearchError(e instanceof Error ? e.message : 'Error al consultar')
    } finally {
      setSearching(false)
    }
  }, [token, searchId])

  const handleCreateSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!token) {
        return
      }

      setCreateError(null)
      setCreateSuccess(false)

      const built = buildCreateDto(formState)

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
        setSnackbarOpen(true)
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Error al crear la entrada')
      } finally {
        setCreating(false)
      }
    },
    [token, formState]
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

  const onSearchEntryChange = (ev: SelectChangeEvent<number | ''>) => {
    const v = ev.target.value

    setSearchId(v === '' ? '' : String(v))
  }

  return (
    <Stack spacing={4}>
      {noToken ? (
        <Alert severity='warning'>Inicia sesión para consultar y crear entradas de agua destilada.</Alert>
      ) : null}

      <Card variant='outlined'>
        <CardHeader title='Consultar agua destilada por entrada' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <FormControl size='small' sx={{ minWidth: 220 }} disabled={!token || searching}>
                <InputLabel id='distilled-search-entry-label'>Entrada</InputLabel>
                <Select
                  labelId='distilled-search-entry-label'
                  label='Entrada'
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
              {searching ? <CircularProgress size={24} /> : null}
            </Stack>

            {searchError ? <Alert severity='error'>{searchError}</Alert> : null}

            {!searching && result ? <DistilledWaterResultTable data={result} /> : null}

            {!searching && !searchError && !result ? (
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
          <Box component='form' onSubmit={handleCreateSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size='small' required disabled={!token || creating}>
                  <InputLabel id='dw-folio-label'>Folio</InputLabel>
                  <Select
                    labelId='dw-folio-label'
                    label='Folio'
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
                  <InputLabel id='dw-logbook-label'>Bitácora</InputLabel>
                  <Select
                    labelId='dw-logbook-label'
                    label='Bitácora'
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
                  <InputLabel id='dw-user-label'>Usuario</InputLabel>
                  <Select
                    labelId='dw-user-label'
                    label='Usuario'
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

              {FORM_FIELDS.map(f => (
                <Grid key={f.key} item xs={12} md={f.md}>
                  <TextField
                    label={f.label}
                    name={f.key}
                    type='text'
                    fullWidth
                    size='small'
                    value={formState[f.key] ?? ''}
                    onChange={ev => setFormState(prev => ({ ...prev, [f.key]: ev.target.value }))}
                    disabled={!token || creating}
                    inputProps={{ inputMode: 'decimal' }}
                  />
                </Grid>
              ))}

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size='small' disabled={!token || creating}>
                  <InputLabel id='dw-batch-label'>Lote de agua</InputLabel>
                  <Select
                    labelId='dw-batch-label'
                    label='Lote de agua'
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
                <Button type='submit' variant='contained' disabled={!token || creating}>
                  Crear entrada
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
              <Typography variant='subtitle2' className='mbe-2'>
                Resultado
              </Typography>
              <DistilledWaterResultTable data={createResult} />
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message='Entrada de agua destilada creada'
      />
    </Stack>
  )
}

export default DistilledWaterPanel
