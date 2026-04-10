'use client'

// React Imports
import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import type { CrudFieldDef, CrudFieldType } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

export type CrudFormDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (values: Record<string, unknown>) => void | Promise<void>
  fields: CrudFieldDef[]
  title: string
  initialValues?: Record<string, unknown> | null
  loading?: boolean
  error?: string | null
}

function emptyDefaultForType(type: CrudFieldType): unknown {
  if (type === 'boolean') {
    return false
  }

  if (type === 'number' || type === 'async-select') {
    return ''
  }

  return ''
}

function normalizeDateInitial(value: unknown): unknown {
  if (typeof value === 'string' && value.includes('T')) {
    return value.slice(0, 10)
  }

  return value
}

function buildInitialFormState(
  fields: CrudFieldDef[],
  initialValues: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const state: Record<string, unknown> = {}

  for (const field of fields) {
    let value: unknown

    if (initialValues != null && initialValues[field.key] !== undefined) {
      value = initialValues[field.key]

      if (field.type === 'date') {
        value = normalizeDateInitial(value)
      }
    } else if (field.defaultValue !== undefined) {
      value = field.defaultValue
    } else {
      value = emptyDefaultForType(field.type)
    }

    state[field.key] = value
  }

  return state
}

function isEmptyForValidation(field: CrudFieldDef, value: unknown): boolean {
  if (field.type === 'boolean') {
    return value !== true
  }

  if (value == null) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  if (field.type === 'number' || field.type === 'async-select') {
    if (value === '') {
      return true
    }

    const n = Number(value)

    return Number.isNaN(n)
  }

  return false
}

function fieldErrorMessage(field: CrudFieldDef, value: unknown, touched: boolean): string | null {
  if (!field.required || !touched) {
    return null
  }

  if (isEmptyForValidation(field, value)) {
    return 'Este campo es requerido.'
  }

  return null
}

function buildCleanPayload(fields: CrudFieldDef[], formState: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const field of fields) {
    const raw = formState[field.key]

    if (field.type === 'boolean') {
      out[field.key] = Boolean(raw)

      continue
    }

    if (field.type === 'number') {
      if (raw === '' || raw == null) {
        continue
      }

      const n = Number(raw)

      if (Number.isNaN(n)) {
        continue
      }

      out[field.key] = n

      continue
    }

    if (field.type === 'date') {
      if (typeof raw === 'string' && raw.trim() !== '') {
        const dateStr = raw.trim()

        // Solo Instant en backend (asInstant); LocalDate sigue en YYYY-MM-DD
        if (field.dateAsIsoInstant === true) {
          out[field.key] = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`
        } else {
          out[field.key] = dateStr
        }
      }

      continue
    }

    if (field.type === 'async-select') {
      if (raw === '' || raw == null) {
        continue
      }

      const n = Number(raw)

      if (Number.isNaN(n)) {
        continue
      }

      out[field.key] = n

      continue
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim()

      if (trimmed === '') {
        continue
      }

      out[field.key] = trimmed

      continue
    }

    if (raw == null || raw === '') {
      continue
    }

    out[field.key] = raw
  }

  return out
}

function getFormHelperText(title: string): string | null {
  const t = title.toLowerCase()

  if (t.includes('bitácora') || t.includes('bitacora')) {
    return 'El código de bitácora debe ser único. Las bitácoras 1–15 ya existen en el sistema.'
  }

  if (t.includes('bloque')) {
    return 'Define el rango de números para este bloque. El identificador será el prefijo de los folios.'
  }

  if (t.includes('folio')) {
    return 'Selecciona la bitácora y el bloque al que pertenece. Los folios de conductividad se crean automáticamente.'
  }

  if (t.includes('reactivo')) {
    return 'Registra el nombre del reactivo con su fórmula química y unidad de medida.'
  }

  if (t.includes('lote')) {
    return 'Asocia este lote a un reactivo existente. El código de lote debe ser único.'
  }

  // Antes del catálogo genérico de soluciones (p. ej. "Nueva preparación de soluciones")
  if (t.includes('prep') && (t.includes('solución') || t.includes('solucion'))) {
    return 'Requiere tener una pesada registrada previamente. Selecciona la solución del catálogo.'
  }

  if (t.includes('solución') || t.includes('solucion')) {
    return 'Define nombre y concentración. Las 16 soluciones básicas ya están en el catálogo.'
  }

  if (t.includes('insumo')) {
    return 'Registra insumos de consumo del laboratorio como hisopos, consumibles, etc.'
  }

  if (t.includes('frasco')) {
    return 'Selecciona el reactivo y define la cantidad inicial y actual en gramos. La cantidad actual no puede superar la inicial.'
  }

  if (t.includes('equipo')) {
    return 'Registra el tipo y denominación del equipo para su identificación en bitácoras y reportes.'
  }

  if (t.includes('parámetro') || t.includes('parametro')) {
    return '⚠️ Los parámetros de referencia afectan los cálculos de conductividad. Modifícalos solo si el cliente lo solicita explícitamente.'
  }

  if (t.includes('usuario') || t.includes('empleado')) {
    return 'La contraseña solo es necesaria al crear un usuario nuevo. Para aprobar conductividad, asigna nomenclatura TCM o TMC.'
  }

  if (t.includes('alerta')) {
    return 'Registra el tipo y mensaje de la alerta. Puedes asignarla a un usuario específico.'
  }

  if (t.includes('firma')) {
    return 'Las firmas se generan automáticamente al firmar entradas. Usa este formulario solo si necesitas registrar una firma manualmente.'
  }

  if (t.includes('conductividad')) {
    return 'Solo necesitas el tipo y el peso en gramos. El sistema calcula la conductividad automáticamente.'
  }

  if (t.includes('agua destilada') || t.includes('agua')) {
    return 'Ingresa las tres lecturas de pH y CE para que el sistema calcule los promedios. El lote de agua es opcional.'
  }

  if (t.includes('pesada')) {
    return 'Registra el peso del reactivo. Esta pesada será referenciada en Preparación de soluciones.'
  }

  if (t.includes('entrada') && !t.includes('agua') && !t.includes('pesada')) {
    return 'Selecciona la bitácora correspondiente. Esta entrada base será usada por módulos como Temperatura horno, Lavado de material, Pesadas, etc.'
  }

  if (t.includes('matraz')) {
    return 'Requiere tener un registro de Lavado de material y un insumo de hisopos en el catálogo.'
  }

  if (t.includes('lavado')) {
    return 'Registra el tipo de pieza y material lavado. Este registro será referenciado en Tratamiento de matraz.'
  }

  return null
}

const CrudFormDialog = ({
  open,
  onClose,
  onSave,
  fields,
  title,
  initialValues = null,
  loading = false,
  error = null
}: CrudFormDialogProps) => {
  const { token } = useAuth()

  const isEditMode = initialValues != null

  const visibleFields = useMemo(
    () => fields.filter(f => !(isEditMode && f.hideOnEdit)),
    [fields, isEditMode]
  )

  const [formState, setFormState] = useState<Record<string, unknown>>(() =>
    buildInitialFormState(
      fields.filter(f => !(initialValues != null && f.hideOnEdit)),
      initialValues
    )
  )

  const [touchedKeys, setTouchedKeys] = useState<Set<string>>(() => new Set())

  const [asyncOptions, setAsyncOptions] = useState<Record<string, { value: number; label: string }[]>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setFormState(buildInitialFormState(visibleFields, initialValues))
    setTouchedKeys(new Set())
  }, [open, initialValues, visibleFields])

  useEffect(() => {
    if (!open) {
      return
    }

    const asyncFields = visibleFields.filter(f => f.type === 'async-select' && f.optionsApiPath)

    asyncFields.forEach(field => {
      apiFetch<CrudResponseDTO[]>(field.optionsApiPath!, { token: token ?? undefined })
        .then(data => {
          const options = (Array.isArray(data) ? data : []).map(item => {
            const valueKey = field.optionValueKey || 'id'
            const value = valueKey === 'id' ? item.id : (item.values?.[valueKey] as number)

            const labelKey = field.optionLabelKey || 'name'
            let label: string

            if (Array.isArray(labelKey)) {
              label = labelKey.map(k => item.values?.[k] ?? (item as Record<string, unknown>)[k] ?? '').join(' ').trim()
            } else {
              label = String(
                item.values?.[labelKey] ?? (item as Record<string, unknown>)[labelKey] ?? `#${item.id}`
              )
            }

            return { value: Number(value), label: label || `#${item.id}` }
          })

          setAsyncOptions(prev => ({ ...prev, [field.key]: options }))
        })
        .catch(() => {
          setAsyncOptions(prev => ({ ...prev, [field.key]: [] }))
        })
    })
  }, [open, visibleFields, token])

  const setValue = useCallback((key: string, value: unknown) => {
    setFormState(prev => ({ ...prev, [key]: value }))
  }, [])

  const markTouched = useCallback((key: string) => {
    setTouchedKeys(prev => {
      if (prev.has(key)) {
        return prev
      }

      const next = new Set(prev)

      next.add(key)

      return next
    })
  }, [])

  const validateAll = useCallback((): boolean => {
    for (const field of visibleFields) {
      if (!field.required) {
        continue
      }

      if (isEmptyForValidation(field, formState[field.key])) {
        return false
      }
    }

    return true
  }, [visibleFields, formState])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const all = new Set(visibleFields.map(f => f.key))

    setTouchedKeys(all)

    if (!validateAll()) {
      return
    }

    const payload = buildCleanPayload(visibleFields, formState)

    await Promise.resolve(onSave(payload))
  }

  const handleDialogClose = () => {
    if (loading) {
      return
    }

    onClose()
  }

  const isReadOnlyField = (field: CrudFieldDef): boolean => Boolean(isEditMode && field.readOnlyOnEdit)

  const primaryLabel = isEditMode ? 'Actualizar' : 'Crear'

  const helperText = getFormHelperText(title)

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth='sm'
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 3 }}>{title}</DialogTitle>
      <form onSubmit={e => void handleSubmit(e)} noValidate>
        <DialogContent sx={{ pt: '24px !important' }}>
          {helperText ? (
            <Alert severity='info' variant='outlined' sx={{ mb: 2, fontSize: '0.82rem' }}>
              {helperText}
            </Alert>
          ) : null}
          {error ? (
            <Alert severity='error' className='mbe-4'>
              {error}
            </Alert>
          ) : null}
          <Grid container spacing={3}>
            {visibleFields.map(field => {
              const value = formState[field.key]
              const touched = touchedKeys.has(field.key)
              const errMsg = fieldErrorMessage(field, value, touched)
              const readOnly = isReadOnlyField(field)
              const gridSm = field.gridCols != null && field.gridCols >= 1 && field.gridCols <= 12 ? field.gridCols : 12

              const showFieldError = Boolean(errMsg)

              if (field.type === 'boolean') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <FormControl error={showFieldError} fullWidth>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(value)}
                            disabled={loading || readOnly}
                            onChange={e => {
                              markTouched(field.key)
                              setValue(field.key, e.target.checked)
                            }}
                            name={field.key}
                          />
                        }
                        label={field.label}
                      />
                      {field.helperText && !showFieldError ? (
                        <FormHelperText>{field.helperText}</FormHelperText>
                      ) : null}
                      {showFieldError ? <FormHelperText>{errMsg}</FormHelperText> : null}
                    </FormControl>
                  </Grid>
                )
              }

              if (field.type === 'select') {
                const selectVal =
                  value === undefined || value === null || value === '' ? '' : (value as string | number)

                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <FormControl fullWidth error={showFieldError} margin='normal' disabled={loading || readOnly}>
                      <InputLabel id={`${field.key}-label`} shrink>
                        {field.label}
                        {field.required ? ' *' : ''}
                      </InputLabel>
                      <Select
                        labelId={`${field.key}-label`}
                        label={`${field.label}${field.required ? ' *' : ''}`}
                        notched
                        value={selectVal}
                        onChange={e => {
                          markTouched(field.key)
                          setValue(field.key, e.target.value)
                        }}
                        onBlur={() => markTouched(field.key)}
                      >
                        {!field.required ? <MenuItem value=''>—</MenuItem> : null}
                        {(field.options ?? []).map(opt => (
                          <MenuItem key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {field.helperText && !showFieldError ? <FormHelperText>{field.helperText}</FormHelperText> : null}
                      {showFieldError ? <FormHelperText>{errMsg}</FormHelperText> : null}
                    </FormControl>
                  </Grid>
                )
              }

              if (field.type === 'async-select') {
                const loadedOptions = asyncOptions[field.key] ?? []
                const selectVal = value === undefined || value === null || value === '' ? '' : Number(value)

                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <FormControl fullWidth error={showFieldError} margin='normal' disabled={loading || readOnly}>
                      <InputLabel id={`${field.key}-label`} shrink>
                        {field.label}
                        {field.required ? ' *' : ''}
                      </InputLabel>
                      <Select
                        labelId={`${field.key}-label`}
                        label={`${field.label}${field.required ? ' *' : ''}`}
                        notched
                        value={selectVal}
                        onChange={e => {
                          markTouched(field.key)
                          setValue(field.key, e.target.value)
                        }}
                        onBlur={() => markTouched(field.key)}
                      >
                        {!field.required && loadedOptions.length > 0 ? (
                          <MenuItem value=''>— Ninguno —</MenuItem>
                        ) : null}
                        {loadedOptions.length === 0 ? (
                          <MenuItem value='' disabled>
                            Cargando...
                          </MenuItem>
                        ) : null}
                        {loadedOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {field.helperText && !showFieldError ? <FormHelperText>{field.helperText}</FormHelperText> : null}
                      {showFieldError ? <FormHelperText>{errMsg}</FormHelperText> : null}
                    </FormControl>
                  </Grid>
                )
              }

              const commonTextFieldProps = {
                fullWidth: true,
                margin: 'normal' as const,
                label: `${field.label}${field.required ? ' *' : ''}`,
                error: showFieldError,
                helperText: showFieldError ? errMsg : field.helperText,
                placeholder: field.placeholder,
                disabled: loading,
                InputProps: readOnly ? { readOnly: true } : undefined,
                onBlur: () => markTouched(field.key)
              }

              if (field.type === 'textarea') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <TextField
                      {...commonTextFieldProps}
                      multiline
                      minRows={3}
                      value={value ?? ''}
                      onChange={e => {
                        markTouched(field.key)
                        setValue(field.key, e.target.value)
                      }}
                    />
                  </Grid>
                )
              }

              if (field.type === 'date') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <TextField
                      {...commonTextFieldProps}
                      type='date'
                      InputLabelProps={{ shrink: true }}
                      value={value ?? ''}
                      onChange={e => {
                        markTouched(field.key)
                        setValue(field.key, e.target.value)
                      }}
                    />
                  </Grid>
                )
              }

              if (field.type === 'number') {
                return (
                  <Grid item xs={12} sm={gridSm} key={field.key}>
                    <TextField
                      {...commonTextFieldProps}
                      type='number'
                      value={value ?? ''}
                      onChange={e => {
                        markTouched(field.key)
                        setValue(field.key, e.target.value)
                      }}
                      inputProps={{
                        min: field.min ?? 0,
                        step: field.step ?? 'any'
                      }}
                    />
                  </Grid>
                )
              }

              return (
                <Grid item xs={12} sm={gridSm} key={field.key}>
                  <TextField
                    {...commonTextFieldProps}
                    value={value ?? ''}
                    onChange={e => {
                      markTouched(field.key)
                      setValue(field.key, e.target.value)
                    }}
                  />
                </Grid>
              )
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3, flexWrap: 'wrap', gap: 1 }}>
          <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}>
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            <Button type='submit' variant='contained' sx={{ minWidth: 120 }} disabled={loading}>
              {primaryLabel}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CrudFormDialog
