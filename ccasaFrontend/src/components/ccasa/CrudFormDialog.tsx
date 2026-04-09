'use client'

// React Imports
import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
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
    return 'Este campo es obligatorio'
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
    return 'Define el código único y el nombre de la bitácora. El código no se puede repetir.'
  }

  if (t.includes('folio')) {
    return 'Selecciona la bitácora y el bloque al que pertenece este folio. El número de folio debe ser único dentro del bloque.'
  }

  if (t.includes('reactivo')) {
    return 'Registra el nombre del reactivo. Puedes agregar descripción y unidad de medida.'
  }

  if (t.includes('lote')) {
    return 'Asocia este lote a un reactivo existente e ingresa el código de lote.'
  }

  if (t.includes('solución') || t.includes('solucion')) {
    return 'Define el nombre y la concentración de la solución.'
  }

  if (t.includes('insumo')) {
    return 'Registra el nombre y descripción del insumo.'
  }

  if (t.includes('frasco')) {
    return 'Selecciona el reactivo y define las cantidades inicial y actual en gramos. La cantidad actual no puede ser mayor a la inicial.'
  }

  if (t.includes('equipo')) {
    return 'Define el tipo y la denominación del equipo para su identificación en el laboratorio.'
  }

  if (t.includes('parámetro') || t.includes('parametro')) {
    return 'Los parámetros de referencia afectan directamente los cálculos de conductividad. Modifícalos con precaución.'
  }

  if (t.includes('usuario') || t.includes('empleado')) {
    return 'Completa todos los campos obligatorios. La contraseña solo es necesaria al crear un usuario nuevo.'
  }

  if (t.includes('alerta')) {
    return 'Registra el tipo, mensaje y estado inicial de la alerta.'
  }

  if (t.includes('firma')) {
    return 'Selecciona el tipo de firma y la entrada a la que corresponde.'
  }

  if (t.includes('entrada')) {
    return 'Selecciona la bitácora a la que pertenece esta entrada.'
  }

  if (t.includes('conductividad')) {
    return 'Solo necesitas el tipo y el peso. El sistema calcula automáticamente la conductividad teórica.'
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
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 3 }}>
          <Button type='button' variant='outlined' color='secondary' onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type='submit' variant='contained' sx={{ minWidth: 120 }} disabled={loading}>
            {primaryLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CrudFormDialog
