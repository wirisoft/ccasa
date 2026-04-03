'use client'

// React Imports
import type { FormEvent } from 'react'
import { useCallback, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
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
import type { DistilledWaterRequestDTO, DistilledWaterResponseDTO } from '@/lib/ccasa/types'

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
  { key: 'folioId', label: 'ID Folio', required: true, md: 4 },
  { key: 'logbookId', label: 'ID Bitácora', required: true, md: 4 },
  { key: 'userId', label: 'ID Usuario', required: true, md: 4 },
  { key: 'phReading1', label: 'pH Lectura 1', md: 4 },
  { key: 'phReading2', label: 'pH Lectura 2', md: 4 },
  { key: 'phReading3', label: 'pH Lectura 3', md: 4 },
  { key: 'ceReading1', label: 'CE Lectura 1', md: 4 },
  { key: 'ceReading2', label: 'CE Lectura 2', md: 4 },
  { key: 'ceReading3', label: 'CE Lectura 3', md: 4 },
  { key: 'referenceDifference', label: 'Diferencia referencia', md: 6 },
  { key: 'controlStandardPct', label: 'Estándar control %', md: 6 },
  { key: 'waterBatchId', label: 'ID Lote de agua', md: 6 }
]

function formatCell(value: number | string | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  return String(value)
}

function responseToTableRows(d: DistilledWaterResponseDTO): { field: string; value: string }[] {
  return [
    { field: 'entryId', value: formatCell(d.entryId) },
    { field: 'distilledWaterEntryId', value: formatCell(d.distilledWaterEntryId) },
    { field: 'phReading1', value: formatCell(d.phReading1) },
    { field: 'phReading2', value: formatCell(d.phReading2) },
    { field: 'phReading3', value: formatCell(d.phReading3) },
    { field: 'phAverage', value: formatCell(d.phAverage) },
    { field: 'ceReading1', value: formatCell(d.ceReading1) },
    { field: 'ceReading2', value: formatCell(d.ceReading2) },
    { field: 'ceReading3', value: formatCell(d.ceReading3) },
    { field: 'ceAverage', value: formatCell(d.ceAverage) },
    { field: 'referenceDifference', value: formatCell(d.referenceDifference) },
    { field: 'controlStandardPct', value: formatCell(d.controlStandardPct) },
    {
      field: 'isAcceptable',
      value: d.isAcceptable === null ? '—' : d.isAcceptable ? 'Sí' : 'No'
    },
    { field: 'waterBatchId', value: formatCell(d.waterBatchId) },
    { field: 'entryStatus', value: formatCell(d.entryStatus) }
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
    return { ok: false, message: 'ID Folio es obligatorio y debe ser un número válido.' }
  }

  if (!form.logbookId?.trim() || !Number.isFinite(logbookId)) {
    return { ok: false, message: 'ID Bitácora es obligatorio y debe ser un número válido.' }
  }

  if (!form.userId?.trim() || !Number.isFinite(userId)) {
    return { ok: false, message: 'ID Usuario es obligatorio y debe ser un número válido.' }
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
            <TableRow key={row.field}>
              <TableCell component='th' scope='row' sx={{ fontWeight: 600, width: '40%' }}>
                {row.field}
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
  const [result, setResult] = useState<DistilledWaterResponseDTO | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [formState, setFormState] = useState<Record<string, string>>(() => ({ ...EMPTY_FORM }))
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createResult, setCreateResult] = useState<DistilledWaterResponseDTO | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!token) {
      return
    }

    setSearchError(null)
    const id = searchId.trim()

    if (!id) {
      setSearchError('Ingresa un ID de entrada.')
      setResult(null)

      return
    }

    if (!Number.isFinite(Number(id))) {
      setSearchError('El ID de entrada debe ser un número válido.')
      setResult(null)

      return
    }

    setSearching(true)
    setResult(null)

    try {
      const data = await apiFetch<DistilledWaterResponseDTO>(`/api/v1/entries/${encodeURIComponent(id)}/distilled-water`)

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
          body: JSON.stringify(built.dto)
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
              <TextField
                label='ID de entrada'
                type='text'
                value={searchId}
                onChange={ev => setSearchId(ev.target.value)}
                disabled={!token || searching}
                size='small'
                sx={{ minWidth: 200 }}
                inputProps={{ inputMode: 'numeric' }}
              />
              <Button variant='contained' onClick={() => void handleSearch()} disabled={!token || searching}>
                Consultar
              </Button>
              {searching ? <CircularProgress size={24} /> : null}
            </Stack>

            {searchError ? <Alert severity='error'>{searchError}</Alert> : null}

            {!searching && result ? <DistilledWaterResultTable data={result} /> : null}

            {!searching && !searchError && !result ? (
              <Typography variant='body2' color='text.secondary'>
                Ingresa un ID de entrada para consultar
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardHeader title='Nueva entrada de agua destilada (dominio)' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Box component='form' onSubmit={handleCreateSubmit}>
            <Grid container spacing={2}>
              {FORM_FIELDS.map(f => (
                <Grid key={f.key} item xs={12} md={f.md}>
                  <TextField
                    label={f.label}
                    name={f.key}
                    type='text'
                    required={f.required}
                    fullWidth
                    size='small'
                    value={formState[f.key] ?? ''}
                    onChange={ev => setFormState(prev => ({ ...prev, [f.key]: ev.target.value }))}
                    disabled={!token || creating}
                    inputProps={f.key !== 'folioId' && f.key !== 'logbookId' && f.key !== 'userId' ? { inputMode: 'decimal' } : { inputMode: 'numeric' }}
                  />
                </Grid>
              ))}
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
