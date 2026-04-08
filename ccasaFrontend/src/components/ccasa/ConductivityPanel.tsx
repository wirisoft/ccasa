'use client'

import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

import CrudDeleteDialog from '@components/ccasa/CrudDeleteDialog'
import { useAuth } from '@/contexts/AuthContext'
import { useCrudOperations } from '@/hooks/ccasa/useCrudOperations'
import { apiFetch } from '@/lib/ccasa/api'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

const API_PATH = '/api/v1/entry-conductivity'
const ENTRIES_PATH = '/api/v1/entries'

type ConductivityTypeValue = 'High' | 'Low'

function typeLabel(raw: unknown): string {
  if (raw === 'High') return 'Alta'
  if (raw === 'Low') return 'Baja'

  return String(raw ?? '')
}

function formatMol(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  const n = typeof v === 'number' ? v : Number(v)

  if (Number.isNaN(n)) return '—'

  return n.toFixed(4)
}

function formatConductivity(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  const n = typeof v === 'number' ? v : Number(v)

  if (Number.isNaN(n)) return '—'

  return n.toFixed(2)
}

function formatDateDdMmYyyy(iso: unknown): string {
  if (iso == null || iso === '') return '—'
  const s = String(iso)

  if (!/^\d{4}-\d{2}-\d{2}/.test(s) && !s.includes('T')) return s

  const d = new Date(s)

  if (Number.isNaN(d.getTime())) return '—'

  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()

  return `${day}/${month}/${year}`
}

function inRangeChip(inRange: unknown) {
  if (inRange === true) {
    return <Chip size='small' color='success' label='Sí' />
  }

  if (inRange === false) {
    return <Chip size='small' color='error' label='No' />
  }

  return <Chip size='small' variant='outlined' label='—' />
}

function rowSearchText(row: CrudResponseDTO): string {
  const v = row.values ?? {}
  const ir = v.inRange

  const rangeTxt = ir === true ? 'sí' : ir === false ? 'no' : ''

  const parts = [
    typeLabel(v.type),
    v.weightGrams != null ? String(v.weightGrams) : '',
    formatMol(v.calculatedMol),
    formatConductivity(v.calculatedValue),
    rangeTxt,
    formatDateDdMmYyyy(v.autoDate),
    v.entryId != null ? String(v.entryId) : ''
  ]

  return parts.join(' ').toLowerCase()
}

const ConductivityPanel = () => {
  const { token } = useAuth()
  const { loading: crudLoading, error: crudError, create, update, remove, clearError } = useCrudOperations()

  const [rows, setRows] = useState<CrudResponseDTO[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<CrudResponseDTO | null>(null)
  const [formType, setFormType] = useState<ConductivityTypeValue | ''>('')
  const [formWeight, setFormWeight] = useState('')
  const [formEntryId, setFormEntryId] = useState<number | ''>('')

  const [entryOptions, setEntryOptions] = useState<CrudResponseDTO[]>([])
  const [entriesLoadError, setEntriesLoadError] = useState<string | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRow, setDeletingRow] = useState<CrudResponseDTO | null>(null)

  const [snackbar, setSnackbar] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    if (!token) {
      return
    }

    setLoadError(null)

    try {
      const data = await apiFetch<CrudResponseDTO[]>(API_PATH)

      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setRows([])
      setLoadError(e instanceof Error ? e.message : 'Error al cargar datos')
    }
  }, [token])

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  const loadEntries = useCallback(async () => {
    if (!token) {
      return
    }

    setEntriesLoadError(null)

    try {
      const data = await apiFetch<CrudResponseDTO[]>(ENTRIES_PATH)

      setEntryOptions(Array.isArray(data) ? data : [])
    } catch (e) {
      setEntryOptions([])
      setEntriesLoadError(e instanceof Error ? e.message : 'Error al cargar entradas')
    }
  }, [token])

  useEffect(() => {
    if (formOpen) {
      void loadEntries()
    }
  }, [formOpen, loadEntries])

  const filteredRows = useMemo(() => {
    if (!rows) {
      return []
    }

    const q = searchQuery.trim().toLowerCase()

    if (!q) {
      return rows
    }

    return rows.filter(row => rowSearchText(row).includes(q))
  }, [rows, searchQuery])

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage

    return filteredRows.slice(start, start + rowsPerPage)
  }, [filteredRows, page, rowsPerPage])

  useEffect(() => {
    setPage(0)
  }, [searchQuery])

  const handleOpenCreate = useCallback(() => {
    clearError()
    setEditingRow(null)
    setFormType('')
    setFormWeight('')
    setFormEntryId('')
    setFormOpen(true)
  }, [clearError])

  const handleOpenEdit = useCallback(
    (row: CrudResponseDTO) => {
      clearError()
      setEditingRow(row)
      const v = row.values ?? {}
      const t = v.type === 'High' || v.type === 'Low' ? v.type : ''
      setFormType(t)
      setFormWeight(v.weightGrams != null ? String(v.weightGrams) : '')
      const eid = v.entryId

      setFormEntryId(typeof eid === 'number' ? eid : eid != null ? Number(eid) : '')
      setFormOpen(true)
    },
    [clearError]
  )

  const handleCloseForm = useCallback(() => {
    if (crudLoading) {
      return
    }

    clearError()
    setFormOpen(false)
    setEditingRow(null)
  }, [clearError, crudLoading])

  const handleSave = useCallback(async () => {
    if (formType === '' || formEntryId === '' || formWeight.trim() === '') {
      return
    }

    const weightNum = Number(formWeight)

    if (Number.isNaN(weightNum)) {
      return
    }

    const values: Record<string, unknown> = {
      type: formType,
      weightGrams: weightNum,
      entryId: formEntryId
    }

    if (editingRow) {
      const res = await update(API_PATH, editingRow.id, values)

      if (res) {
        setFormOpen(false)
        setEditingRow(null)
        clearError()
        setSnackbar('Registro actualizado correctamente')
        void fetchRows()
      }
    } else {
      const res = await create(API_PATH, values)

      if (res) {
        setFormOpen(false)
        setEditingRow(null)
        clearError()
        setSnackbar('Registro creado correctamente')
        void fetchRows()
      }
    }
  }, [clearError, create, editingRow, fetchRows, formEntryId, formType, formWeight, update])

  const handleOpenDelete = useCallback(
    (row: CrudResponseDTO) => {
      clearError()
      setDeletingRow(row)
      setDeleteOpen(true)
    },
    [clearError]
  )

  const handleCloseDelete = useCallback(() => {
    if (crudLoading) {
      return
    }

    clearError()
    setDeleteOpen(false)
    setDeletingRow(null)
  }, [clearError, crudLoading])

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingRow) {
      return
    }

    const ok = await remove(API_PATH, deletingRow.id)

    if (ok) {
      setDeleteOpen(false)
      setDeletingRow(null)
      clearError()
      setSnackbar('Registro eliminado correctamente')
      void fetchRows()
    }
  }, [clearError, deletingRow, fetchRows, remove])

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const formValid =
    formType !== '' && formEntryId !== '' && formWeight.trim() !== '' && !Number.isNaN(Number(formWeight))

  const formulaAlertText =
    formType === 'High'
      ? 'Fórmula Alta: mol = peso × F24 / C26 → conductividad = mol × F28 / D28 (µS/cm) | Rango de aceptación: ~1400–1420 µS/cm'
      : formType === 'Low'
        ? 'Fórmula Baja: mol = peso × F24 / C26 → conductividad = mol × F28 / D28 (µS/cm) | Rango de aceptación: ~1400–1420 µS/cm'
        : null

  const handleExportPdf = useCallback(() => {
    if (!rows || rows.length === 0) {
      return
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Bitácoras Servicios Ambientales', pageWidth / 2, 15, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Registros de Conductividad (KCl)', pageWidth / 2, 22, { align: 'center' })

    const now = new Date()
    const fechaGen = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.setFontSize(8)
    doc.text(`Generado: ${fechaGen}`, 14, 29)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Fórmulas aplicadas (KCl Alta y Baja):', 14, 36)
    doc.setFont('helvetica', 'normal')
    doc.text('mol = peso(g) × F24 / C26', 14, 41)
    doc.text('conductividad(µS/cm) = mol × F28 / D28', 14, 46)
    doc.text('Rango de aceptación teórico: ~1400–1420 µS/cm', 14, 51)

    const tableRows = rows.map((item, idx) => {
      const v = item.values ?? {}
      const tipo = v.type === 'High' ? 'Alta' : v.type === 'Low' ? 'Baja' : String(v.type ?? '—')
      const peso = v.weightGrams != null ? Number(v.weightGrams).toFixed(4) : '—'
      const mol = v.calculatedMol != null ? Number(v.calculatedMol).toFixed(6) : '—'
      const cond = v.calculatedValue != null ? Number(v.calculatedValue).toFixed(2) : '—'
      const rango = v.inRange === true ? 'Sí' : v.inRange === false ? 'No' : '—'
      const fecha = v.autoDate
        ? new Date(String(v.autoDate)).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : '—'
      const entrada = v.entryId != null ? `#${v.entryId}` : '—'
      const creadoPor = v.createdByUserId != null ? `Usuario #${v.createdByUserId}` : '—'

      return [idx + 1, tipo, peso, mol, cond, rango, fecha, entrada, creadoPor]
    })

    autoTable(doc, {
      startY: 56,
      head: [
        [
          '#',
          'Tipo',
          'Peso (g)',
          'Mol calculado',
          'Conductividad (µS/cm)',
          '¿En rango?',
          'Fecha',
          'Entrada',
          'Creado por'
        ]
      ],
      body: tableRows,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: {
        fillColor: [21, 101, 192],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 8 },
        4: { cellWidth: 32 }
      },
      didParseCell: data => {
        if (data.section === 'body' && data.column.index === 5) {
          if (data.cell.raw === 'Sí') {
            data.cell.styles.textColor = [46, 125, 50]
            data.cell.styles.fontStyle = 'bold'
          } else if (data.cell.raw === 'No') {
            data.cell.styles.textColor = [211, 47, 47]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    })

    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      )
    }

    doc.save(`conductividad_${now.toISOString().slice(0, 10)}.pdf`)
  }, [rows])

  const loadingList = rows === null
  const dialogTitle = editingRow ? 'Editar registro' : 'Nuevo registro'

  return (
    <>
      <Card variant='outlined'>
        <CardHeader title='Registros' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          {loadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}
          {loadError ? (
            <Alert severity='error' sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          ) : null}
          {!loadingList && !loadError && rows ? (
            <>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                flexWrap='wrap'
                useFlexGap
                spacing={1}
                sx={{ mb: 2 }}
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
                          <Box component='i' className='ri-search-line' sx={{ fontSize: 18, opacity: 0.5 }} />
                        </InputAdornment>
                      ),
                      ...(searchQuery
                        ? {
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton size='small' onClick={() => setSearchQuery('')} aria-label='Limpiar búsqueda'>
                                  <Box component='i' className='ri-close-line' sx={{ fontSize: 16 }} />
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                        : {})
                    }}
                  />
                  <Button
                    variant='contained'
                    startIcon={<Box component='i' className='ri-add-line' />}
                    onClick={handleOpenCreate}
                    disabled={!token}
                  >
                    Nuevo registro
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<Box component='i' className='ri-file-pdf-2-line' />}
                    onClick={handleExportPdf}
                    disabled={!rows || rows.length === 0}
                  >
                    Exportar PDF
                  </Button>
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
                          <TableCell sx={{ width: 56 }}>#</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Peso (g)</TableCell>
                          <TableCell>Mol calculado</TableCell>
                          <TableCell>Conductividad (µS/cm)</TableCell>
                          <TableCell>¿En rango?</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Entrada ID</TableCell>
                          <TableCell align='center'>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedRows.map((row, index) => {
                          const v = row.values ?? {}

                          return (
                            <TableRow key={row.id} hover>
                              <TableCell sx={{ color: 'text.secondary' }}>{page * rowsPerPage + index + 1}</TableCell>
                              <TableCell>{typeLabel(v.type)}</TableCell>
                              <TableCell>{v.weightGrams != null ? String(v.weightGrams) : '—'}</TableCell>
                              <TableCell>{formatMol(v.calculatedMol)}</TableCell>
                              <TableCell>{formatConductivity(v.calculatedValue)}</TableCell>
                              <TableCell>{inRangeChip(v.inRange)}</TableCell>
                              <TableCell>{formatDateDdMmYyyy(v.autoDate)}</TableCell>
                              <TableCell>{v.entryId != null ? String(v.entryId) : '—'}</TableCell>
                              <TableCell align='center'>
                                <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                                  <Tooltip title='Editar'>
                                    <span>
                                      <IconButton
                                        color='default'
                                        aria-label='Editar'
                                        sx={{ width: 32, height: 32 }}
                                        onClick={() => handleOpenEdit(row)}
                                      >
                                        <Box component='i' className='ri-pencil-line' />
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
                                      >
                                        <Box component='i' className='ri-delete-bin-line' />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
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
                    count={filteredRows.length}
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

      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth='sm' PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>{dialogTitle}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {entriesLoadError ? (
            <Alert severity='warning' sx={{ mb: 2 }}>
              {entriesLoadError}
            </Alert>
          ) : null}
          {crudError ? (
            <Alert severity='error' sx={{ mb: 2 }}>
              {crudError}
            </Alert>
          ) : null}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required size='small'>
              <InputLabel id='conductivity-type-label'>Tipo</InputLabel>
              <Select<ConductivityTypeValue | ''>
                labelId='conductivity-type-label'
                label='Tipo'
                value={formType}
                onChange={(e: SelectChangeEvent<ConductivityTypeValue | ''>) =>
                  setFormType(e.target.value as ConductivityTypeValue | '')
                }
              >
                <MenuItem value=''>
                  <em>Seleccione…</em>
                </MenuItem>
                <MenuItem value='High'>Alta (KCl)</MenuItem>
                <MenuItem value='Low'>Baja (KCl)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              required
              fullWidth
              size='small'
              type='number'
              label='Peso (g)'
              value={formWeight}
              onChange={e => setFormWeight(e.target.value)}
              inputProps={{ step: 'any' }}
            />
            {formulaAlertText ? (
              <Alert severity='info' variant='outlined'>
                {formulaAlertText}
              </Alert>
            ) : null}
            <FormControl fullWidth required size='small'>
              <InputLabel id='conductivity-entry-label'>Entrada</InputLabel>
              <Select<number | ''>
                labelId='conductivity-entry-label'
                label='Entrada'
                value={formEntryId}
                onChange={(e: SelectChangeEvent<number | ''>) => {
                  const val = e.target.value

                  setFormEntryId(val === '' ? '' : Number(val))
                }}
              >
                <MenuItem value=''>
                  <em>Seleccione…</em>
                </MenuItem>
                {entryOptions.map(opt => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {`Entrada #${opt.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 3, py: 2 }}>
          <Button variant='outlined' onClick={handleCloseForm} disabled={crudLoading}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={() => void handleSave()} disabled={!formValid || crudLoading}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <CrudDeleteDialog
        open={deleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        resourceLabel='registro de conductividad'
        itemLabel={deletingRow ? `ID ${deletingRow.id}` : undefined}
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

export default ConductivityPanel
