'use client'

import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
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
import {
  apiFetch,
  getApiBaseUrl,
  getErrorMessage,
  getHttpErrorMessage,
  PDF_DOWNLOAD_ERROR
} from '@/lib/ccasa/api'
import {
  enqueue,
  getLogbooksCache,
  getPendingQueue,
  saveLogbooksCache
} from '@/lib/ccasa/conductivityOfflineDb'
import {
  addLocalRecord,
  getLocalPendingRecords,
  getRecords,
  removeRecord,
  setMergedStore,
  updateRecord as updateLocalRecord,
} from '@/lib/ccasa/conductivityLocalStore'
import { mergeServerWithLocal } from '@/lib/ccasa/conductivityMerge'
import { CONDUCTIVITY_TYPE_LABELS } from '@/lib/ccasa/crudDisplay'
import { formatDateDdMmYyyy } from '@/lib/ccasa/formatters'
import type {
  ConductivityRecord,
  ConductivityRecordStatus,
  ConductivityType,
  CreateConductivityRequest,
  CrudResponseDTO,
  LogbookDTO
} from '@/lib/ccasa/types'
import { createLogger } from '@/lib/logger'
import { useConnectivity } from '@/hooks/useConnectivity'
import { useConductivityQueue } from '@/hooks/useConductivityQueue'
import type { ApiFetchFn, OutboxRecord } from '@/types/conductivityOffline'

const log = createLogger('ConductivityPanel')

const CONDUCTIVITY_API = '/api/v1/conductivity-records'
const LOGBOOKS_API = '/api/v1/logbooks'

interface UpdateConductivityRequest {
  type?: ConductivityType
  weightGrams?: number
  preparationTime?: string | null
  observation?: string | null
  logbookId?: number | null
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true

  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    return (
      msg.includes('network') ||
      msg.includes('fetch') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('network request failed')
    )
  }

  return false
}

function formatWeight(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return '—'

return Number(v).toFixed(4)
}

function formatConductivityZero(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return '—'

return Math.round(Number(v)).toString()
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

function statusChip(status: ConductivityRecordStatus | null | undefined, isLocal?: boolean) {
  if (isLocal) {
    return <Chip size='small' color='info' label='Local' variant='outlined' />
  }

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

function operationTypeLabel(type: string): string {
  if (type === 'CREATE') return 'Creación'
  if (type === 'UPDATE') return 'Actualización'
  if (type === 'DELETE') return 'Eliminación'
  return type
}

function recordMatchesSearch(record: ConductivityRecord, q: string): boolean {
  if (!q) return true
  const nq = q.trim().toLowerCase()
  const folio = (record.displayFolio ?? '').toLowerCase()
  const tipo = (CONDUCTIVITY_TYPE_LABELS[record.type] ?? String(record.type)).toLowerCase()
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

/** Generates a UUID-like correlation ID for an individual outbox enqueue. */
function newEnqueueCorrelationId(): string {
  return `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const ConductivityPanel = () => {
  const { token } = useAuth()

  // ── PWA: connectivity and queue hooks ───────────────────────────────────
  const { isOnline } = useConnectivity()

  /** Raw fetch adapter used by the sync engine (returns Promise<Response>). */
  const syncApiFetch = useMemo((): ApiFetchFn => {
    return async (url, opts) => {
      const fullUrl = url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`
      return fetch(fullUrl, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Preserve any headers passed by the caller (e.g. X-Sync-Engine: 1)
          ...((opts?.headers as Record<string, string>) ?? {}),
        },
      })
    }
  }, [token])

  const { stats, isSyncing, triggerSync, exportSQL, syncError, failedRecords, retryFailed, dismissFailed, lastSyncCompletedAt } =
    useConductivityQueue(syncApiFetch)

  const outboxPending = stats?.pending ?? 0
  // ── end PWA block ────────────────────────────────────────────────────────

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

  // ── Edit dialog state ────────────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<ConductivityRecord | null>(null)
  const [editFormWeight, setEditFormWeight] = useState('')
  const [editFormPreparationTime, setEditFormPreparationTime] = useState('')
  const [editFormObservation, setEditFormObservation] = useState('')
  const [editFormType, setEditFormType] = useState<ConductivityType | ''>('')
  const [editFormLogbookId, setEditFormLogbookId] = useState('')
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  // ── Delete confirm state ─────────────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState<ConductivityRecord | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // ── Failed ops section collapse ──────────────────────────────────────────
  const [failedSectionOpen, setFailedSectionOpen] = useState(true)

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
  const [logbooksFromCache, setLogbooksFromCache] = useState(false)

  /** Nomenclatura TCM/TMC del usuario en sesión (desde /users/me); vacío = no puede aprobar desde UI. */
  const [myNomenclature, setMyNomenclature] = useState<string | null>(null)

  /** Track previous lastSyncCompletedAt to fire fetchRecords only on new completions. */
  const prevSyncCompletedAtRef = useRef<Date | null>(null)

  useEffect(() => {
    if (!token) {
      setMyNomenclature(null)

      return
    }

    apiFetch<CrudResponseDTO>('/api/v1/users/me', { token })
      .then(data => {
        const raw = data?.values?.nomenclature
        const nom = typeof raw === 'string' ? raw.trim() : ''
        const upper = nom.toUpperCase()

        setMyNomenclature(upper === 'TCM' || upper === 'TMC' ? nom : null)
      })
      .catch(() => {
        setMyNomenclature(null)
      })
  }, [token])

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
      const list = Array.isArray(data) ? data : []

      const pendingQueue = await getPendingQueue()
      const localPending = getLocalPendingRecords()
      const merged = mergeServerWithLocal(list, localPending, pendingQueue)

      setMergedStore(merged)
      setRecords(getRecords())
    } catch (e) {
      setRecords([])
      setError(getErrorMessage(e, 'Error al cargar registros'))
      log.error('Error al cargar registros', e)
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
      const list = Array.isArray(data) ? data : []

      setLogbooks(list)
      setLogbooksFromCache(false)

      if (list.length > 0) {
        await saveLogbooksCache(list)
      }
    } catch {
      // On failure try the local cache (24h expiry)
      const cache = await getLogbooksCache()

      if (cache && cache.data.length > 0) {
        setLogbooks(cache.data)
        setLogbooksFromCache(true)
        log.warn('Usando lista de bitácoras desde caché local (sin red)')
      } else {
        setLogbooks([])
        setLogbooksFromCache(false)
      }
    }
  }, [token])

  useEffect(() => {
    void fetchLogbooks()
  }, [fetchLogbooks])

  useEffect(() => {
    void fetchRecords()
  }, [fetchRecords])

  // ── Watch lastSyncCompletedAt: refresh records after every sync ──────────
  useEffect(() => {
    if (
      lastSyncCompletedAt !== null &&
      lastSyncCompletedAt !== prevSyncCompletedAtRef.current
    ) {
      prevSyncCompletedAtRef.current = lastSyncCompletedAt
      log.info('Sincronización completada — actualizando lista de registros')
      void fetchRecords()
    }
  }, [lastSyncCompletedAt, fetchRecords])

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

    const body: CreateConductivityRequest = {
      type: formType,
      weightGrams: weightNum,
      preparationTime: formPreparationTime.trim() || null,
      observation: formObservation.trim() || null,
      logbookId: Number(formLogbookId)
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const localObjectId = tempId
    const correlationId = newEnqueueCorrelationId()

    const optimisticRecord = {
      conductivityId: -Date.now(),
      entryId: null,
      displayFolio: null,
      type: formType,
      weightGrams: weightNum,
      referenceUScm: null,
      referenceMol: null,
      calculatedMol: null,
      referenceStandardUScm: null,
      calculatedValue: null,
      inRange: null,
      status: 'Draft' as const,
      recordedAt: new Date().toISOString(),
      preparationTime: formPreparationTime.trim() || null,
      observation: formObservation.trim() || null,
      createdByUserId: null,
      createdByName: null,
      createdByNomenclature: null,
      reviewerUserId: null,
      reviewerName: null,
      reviewerNomenclature: null,
      reviewedAt: null,
      isLocal: true as const,
      tempId,
    }

    const enqueueCreate = async () => {
      await enqueue({
        operationType: 'CREATE',
        resourceId: null,
        payload: body,
        endpoint: CONDUCTIVITY_API,
        method: 'POST',
        maxRetries: 5,
        localObjectId,
        correlationId,
      })
    }

    const finishQueuedSuccess = () => {
      setFormError(null)
      setDialogOpen(false)
      setSnackbarSeverity('success')
      setSnackbar(
        'Guardado en cola local. Se enviará al servidor cuando haya conexión (orden FIFO).'
      )
      log.info('Registro encolado localmente (offline)', { operationType: 'CREATE', localObjectId })
    }

    try {
      if (!isOnline) {
        addLocalRecord(optimisticRecord)
        setRecords(getRecords())
        await enqueueCreate()
        finishQueuedSuccess()
        return
      }

      // Online path — try real API
      await apiFetch<ConductivityRecord>(CONDUCTIVITY_API, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      setFormError(null)
      setDialogOpen(false)
      setSnackbarSeverity('success')
      setSnackbar('Registro creado correctamente')
      log.info('Registro creado exitosamente en servidor')
      void fetchRecords()
    } catch (e) {
      if (isNetworkError(e)) {
        try {
          addLocalRecord(optimisticRecord)
          setRecords(getRecords())
          await enqueueCreate()
          finishQueuedSuccess()
        } catch (queueErr) {
          setSnackbarSeverity('error')
          setSnackbar(getErrorMessage(queueErr, 'No se pudo guardar en cola local.'))
          log.error('Error al encolar registro tras fallo de red', queueErr)
        }
      } else {
        setSnackbarSeverity('error')
        setSnackbar(getErrorMessage(e, 'Error al crear registro'))
        log.error('Error al crear registro (respuesta del servidor)', e)
      }
    } finally {
      setSubmitting(false)
    }
  }, [
    fetchRecords,
    formLogbookId,
    formObservation,
    formPreparationTime,
    formType,
    formWeight,
    isOnline
  ])

  // ── Edit handlers ─────────────────────────────────────────────────────────
  const handleOpenEditDialog = useCallback((record: ConductivityRecord) => {
    setEditRecord(record)
    setEditFormType(record.type)
    setEditFormWeight(record.weightGrams != null ? String(record.weightGrams) : '')
    setEditFormPreparationTime(record.preparationTime ?? '')
    setEditFormObservation(record.observation ?? '')
    setEditFormLogbookId('')
    setEditFormError(null)
    setEditDialogOpen(true)
  }, [])

  const handleCloseEditDialog = useCallback(() => {
    if (editSubmitting) return
    setEditDialogOpen(false)
    setEditRecord(null)
    setEditFormError(null)
  }, [editSubmitting])

  const handleUpdate = useCallback(async () => {
    if (!editRecord) return
    setEditFormError(null)

    const weightNum = parseFloat(editFormWeight)
    if (!editFormWeight || Number.isNaN(weightNum) || weightNum <= 0) {
      setEditFormError('El peso debe ser un número mayor a cero.')
      return
    }

    setEditSubmitting(true)

    const body: UpdateConductivityRequest = {
      type: editFormType as ConductivityType,
      weightGrams: weightNum,
      preparationTime: editFormPreparationTime.trim() || null,
      observation: editFormObservation.trim() || null,
      ...(editFormLogbookId ? { logbookId: Number(editFormLogbookId) } : {}),
    }

    const resourceId = String(editRecord.conductivityId)
    const localObjectId = `resource-${resourceId}`
    const correlationId = newEnqueueCorrelationId()
    const endpoint = `${CONDUCTIVITY_API}/${resourceId}`

    const finishQueuedUpdate = () => {
      setEditDialogOpen(false)
      setEditRecord(null)
      setSnackbarSeverity('success')
      setSnackbar('Actualización guardada en cola local. Se enviará al reconectar.')
      log.info('UPDATE encolado localmente', { resourceId, localObjectId })
    }

    try {
      if (!isOnline) {
        // Offline path — optimistic UI + enqueue
        updateLocalRecord(editRecord.conductivityId, {
          ...(editFormType ? { type: editFormType as ConductivityType } : {}),
          weightGrams: weightNum,
          preparationTime: editFormPreparationTime.trim() || null,
          observation: editFormObservation.trim() || null,
        })
        setRecords(getRecords())

        await enqueue({
          operationType: 'UPDATE',
          resourceId,
          payload: body,
          endpoint,
          method: 'PUT',
          maxRetries: 5,
          localObjectId,
          correlationId,
        })
        finishQueuedUpdate()
        return
      }

      // Online path
      await apiFetch<ConductivityRecord>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
        token: token ?? undefined,
      })
      setEditDialogOpen(false)
      setEditRecord(null)
      setSnackbarSeverity('success')
      setSnackbar('Registro actualizado correctamente')
      log.info('Registro actualizado en servidor', { resourceId })
      void fetchRecords()
    } catch (e) {
      if (isNetworkError(e)) {
        try {
          updateLocalRecord(editRecord.conductivityId, {
            ...(editFormType ? { type: editFormType as ConductivityType } : {}),
            weightGrams: weightNum,
            preparationTime: editFormPreparationTime.trim() || null,
            observation: editFormObservation.trim() || null,
          })
          setRecords(getRecords())

          await enqueue({
            operationType: 'UPDATE',
            resourceId,
            payload: body,
            endpoint,
            method: 'PUT',
            maxRetries: 5,
            localObjectId,
            correlationId,
          })
          finishQueuedUpdate()
        } catch (queueErr) {
          setSnackbarSeverity('error')
          setSnackbar(getErrorMessage(queueErr, 'No se pudo guardar actualización en cola local.'))
          log.error('Error al encolar UPDATE tras fallo de red', queueErr)
        }
      } else {
        setSnackbarSeverity('error')
        setSnackbar(getErrorMessage(e, 'Error al actualizar registro'))
        log.error('Error al actualizar registro', e)
      }
    } finally {
      setEditSubmitting(false)
    }
  }, [
    editRecord,
    editFormType,
    editFormWeight,
    editFormPreparationTime,
    editFormObservation,
    editFormLogbookId,
    fetchRecords,
    isOnline,
    token,
  ])

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleOpenDeleteConfirm = useCallback((record: ConductivityRecord) => {
    setDeleteRecord(record)
    setDeleteConfirmOpen(true)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteRecord) return
    setDeleteSubmitting(true)

    const resourceId = String(deleteRecord.conductivityId)
    const localObjectId = `resource-${resourceId}`
    const correlationId = newEnqueueCorrelationId()
    const endpoint = `${CONDUCTIVITY_API}/${resourceId}`

    const finishQueuedDelete = () => {
      setDeleteConfirmOpen(false)
      setDeleteRecord(null)
      setSnackbarSeverity('success')
      setSnackbar('Eliminación guardada en cola local. Se enviará al reconectar.')
      log.info('DELETE encolado localmente', { resourceId, localObjectId })
    }

    try {
      if (!isOnline) {
        // Optimistic: remove from UI immediately
        removeRecord(deleteRecord.conductivityId)
        setRecords(getRecords())

        await enqueue({
          operationType: 'DELETE',
          resourceId,
          payload: {},
          endpoint,
          method: 'DELETE',
          maxRetries: 5,
          localObjectId,
          correlationId,
        })
        finishQueuedDelete()
        return
      }

      // Online path
      await apiFetch<void>(endpoint, {
        method: 'DELETE',
        token: token ?? undefined,
      })
      setDeleteConfirmOpen(false)
      setDeleteRecord(null)
      setSnackbarSeverity('success')
      setSnackbar('Registro eliminado correctamente')
      log.info('Registro eliminado en servidor', { resourceId })
      void fetchRecords()
    } catch (e) {
      if (isNetworkError(e)) {
        try {
          removeRecord(deleteRecord.conductivityId)
          setRecords(getRecords())

          await enqueue({
            operationType: 'DELETE',
            resourceId,
            payload: {},
            endpoint,
            method: 'DELETE',
            maxRetries: 5,
            localObjectId,
            correlationId,
          })
          finishQueuedDelete()
        } catch (queueErr) {
          setSnackbarSeverity('error')
          setSnackbar(getErrorMessage(queueErr, 'No se pudo guardar eliminación en cola local.'))
          log.error('Error al encolar DELETE tras fallo de red', queueErr)
        }
      } else {
        setSnackbarSeverity('error')
        setSnackbar(getErrorMessage(e, 'Error al eliminar registro'))
        log.error('Error al eliminar registro', e)
      }
    } finally {
      setDeleteSubmitting(false)
    }
  }, [deleteRecord, fetchRecords, isOnline, token])

  const handleDownloadPdf = useCallback(
    async (id: number) => {
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
        const record = records.find(r => r.conductivityId === id)
        const folio = record?.displayFolio?.trim()
        const refLabel = folio && folio !== '' ? folio : String(id)

        setSnackbarSeverity('success')
        setSnackbar(`PDF del registro ${refLabel} descargado correctamente`)
      } catch (e) {
        setSnackbarSeverity('error')
        setSnackbar(getErrorMessage(e, PDF_DOWNLOAD_ERROR))
        log.error('Error al descargar PDF', e)
      }
    },
    [token, records]
  )

  const handleReview = useCallback(
    async (id: number) => {
      setReviewing(id)
      setReviewSubmitting(true)

      try {
        await apiFetch<ConductivityRecord>(`${CONDUCTIVITY_API}/${id}/review`, {
          method: 'POST',
          body: JSON.stringify({}),
          token: token ?? undefined
        })
        setSnackbarSeverity('success')
        setSnackbar('Registro revisado correctamente')
        setConfirmReviewOpen(false)
        setReviewingId(null)
        log.info('Registro revisado exitosamente', { id })
        void fetchRecords()
      } catch (e) {
        setSnackbarSeverity('error')
        setSnackbar(getErrorMessage(e, 'Error al revisar'))
        log.error('Error al revisar registro', e)
      } finally {
        setReviewSubmitting(false)
        setReviewing(null)
      }
    },
    [fetchRecords, token]
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

  const editWeightNumPreview = parseFloat(editFormWeight)
  const editFormValid =
    editFormWeight.trim() !== '' &&
    !Number.isNaN(editWeightNumPreview) &&
    editWeightNumPreview > 0

  return (
    <>
      <Card variant='outlined'>
        <CardHeader title='Registros de conductividad' titleTypographyProps={{ variant: 'subtitle1' }} />
        <Box sx={{ px: 2.5, pb: 0, pt: 0 }}>
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
            <i
              className='ri-information-line'
              style={{ color: '#0288d1', fontSize: 18, marginTop: 1, flexShrink: 0 }}
            />
            <Typography variant='body2' sx={{ color: '#01579b', fontSize: '0.82rem' }}>
              Registros de conductividad KCl (RF-05). El sistema calcula automáticamente la conductividad teórica y
              verifica si está en el rango de aceptación (~1400–1420 µS/cm para Alta). Requiere una bitácora activa.
              Para aprobar un registro, debe existir un usuario con nomenclatura TCM o TMC. Sin conexión, los nuevos
              registros se guardan en una cola local (IndexedDB) y se envían en orden al reconectar.
            </Typography>
          </Box>
        </Box>

        {/* ── Offline warning ──────────────────────────────────────────────── */}
        {!isOnline ? (
          <Box sx={{ px: 2.5, pb: 1 }}>
            <Alert severity='warning' sx={{ fontSize: '0.85rem' }}>
              Sin conexión: puedes usar &quot;Nuevo registro&quot; si tienes bitácoras en caché (última sesión con
              red). Los guardados quedan en cola y se suben solos al volver en línea.
            </Alert>
          </Box>
        ) : null}

        {/* ── Sync error ───────────────────────────────────────────────────── */}
        {syncError ? (
          <Box sx={{ px: 2.5, pb: 1 }}>
            <Alert severity='error' sx={{ fontSize: '0.85rem' }}>
              Error de sincronización: {syncError}
            </Alert>
          </Box>
        ) : null}

        {/* ── Outbox queue banner ──────────────────────────────────────────── */}
        {outboxPending > 0 ? (
          <Box sx={{ px: 2.5, pb: 1 }}>
            <Alert
              severity='info'
              sx={{ fontSize: '0.85rem' }}
              action={
                <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
                  <Button
                    color='inherit'
                    size='small'
                    disabled={!isOnline || isSyncing || !token}
                    onClick={() => void triggerSync()}
                  >
                    {isSyncing ? 'Sincronizando…' : 'Sincronizar ahora'}
                  </Button>
                  <Button
                    color='inherit'
                    size='small'
                    onClick={() => {
                      void (async () => {
                        try {
                          await exportSQL()
                          setSnackbarSeverity('success')
                          setSnackbar('Archivo .sql de la cola descargado.')
                        } catch (e) {
                          setSnackbarSeverity('error')
                          setSnackbar(getErrorMessage(e, 'No se pudo exportar la cola.'))
                        }
                      })()
                    }}
                  >
                    Exportar cola (.sql)
                  </Button>
                </Stack>
              }
            >
              Hay {outboxPending} registro{outboxPending === 1 ? '' : 's'} pendiente{outboxPending === 1 ? '' : 's'} de
              sincronizar (cola FIFO en este dispositivo).
            </Alert>
          </Box>
        ) : null}

        {/* ── Failed Operations section ────────────────────────────────────── */}
        {failedRecords.length > 0 ? (
          <Box sx={{ px: 2.5, pb: 1 }}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'error.light',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                  backgroundColor: 'error.50',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'error.100' },
                }}
                onClick={() => setFailedSectionOpen(prev => !prev)}
              >
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Box component='i' className='ri-error-warning-line' sx={{ color: 'error.main', fontSize: 18 }} />
                  <Typography variant='body2' fontWeight={600} color='error.main'>
                    Errores de sincronización ({failedRecords.length})
                  </Typography>
                </Stack>
                <Box component='i'
                  className={failedSectionOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                  sx={{ color: 'error.main', fontSize: 18 }}
                />
              </Box>
              <Collapse in={failedSectionOpen}>
                <Box sx={{ p: 1 }}>
                  {failedRecords.map((rec: OutboxRecord) => (
                    <Box
                      key={rec.localId}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1,
                        py: 0.75,
                        px: 1,
                        borderRadius: 1,
                        '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' },
                      }}
                    >
                      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction='row' spacing={0.75} alignItems='center' flexWrap='wrap'>
                          <Chip
                            size='small'
                            label={operationTypeLabel(rec.operationType)}
                            color='default'
                            variant='outlined'
                          />
                          {rec.conflict ? (
                            <Chip size='small' label='Conflicto' color='warning' />
                          ) : null}
                          <Typography variant='caption' color='text.secondary' noWrap>
                            {rec.endpoint}
                          </Typography>
                        </Stack>
                        {rec.lastError ? (
                          <Typography variant='caption' color='error' sx={{ wordBreak: 'break-word' }}>
                            {rec.lastError}
                          </Typography>
                        ) : null}
                      </Stack>
                      <Stack direction='row' spacing={0.5} flexShrink={0}>
                        <Tooltip title='Reintentar sincronización'>
                          <span>
                            <Button
                              size='small'
                              variant='outlined'
                              color='primary'
                              disabled={!isOnline || isSyncing}
                              onClick={() => {
                                if (rec.localId !== undefined) {
                                  void retryFailed(rec.localId).catch(err => {
                                    setSnackbarSeverity('error')
                                    setSnackbar(getErrorMessage(err, 'No se pudo reintentar.'))
                                  })
                                }
                              }}
                            >
                              Reintentar
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title='Eliminar de la cola (no se podrá recuperar)'>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            onClick={() => {
                              if (rec.localId !== undefined) {
                                void dismissFailed(rec.localId).catch(err => {
                                  setSnackbarSeverity('error')
                                  setSnackbar(getErrorMessage(err, 'No se pudo eliminar.'))
                                })
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </Tooltip>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          </Box>
        ) : null}

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

              {/* ── Status bar: connectivity + queue ──────────────────────── */}
              <Chip
                size='small'
                label={
                  isSyncing
                    ? 'Sincronizando…'
                    : isOnline
                      ? 'En línea'
                      : 'Sin conexión'
                }
                color={isSyncing ? 'warning' : isOnline ? 'success' : 'error'}
                variant='filled'
                sx={{
                  height: 32,
                  ...(isSyncing
                    ? {
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                        },
                        animation: 'pulse 1.4s ease-in-out infinite',
                      }
                    : {}),
                }}
              />
              {outboxPending > 0 ? (
                <Chip
                  size='small'
                  label={`${outboxPending} pendiente${outboxPending === 1 ? '' : 's'}`}
                  color='info'
                  variant='outlined'
                  sx={{ height: 32 }}
                />
              ) : null}
              {/* ── end status bar ─────────────────────────────────────────── */}

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
                          const isLocalRow = (row as { isLocal?: boolean }).isLocal === true
                          const createdLabel =
                            row.createdByName?.trim() ||
                            (row.createdByNomenclature ? row.createdByNomenclature : '—')


return (
                            <TableRow
                              key={(row as { tempId?: string }).tempId ?? row.conductivityId}
                              hover
                              sx={isLocalRow ? { opacity: 0.7 } : undefined}
                            >
                              <TableCell sx={{ color: 'text.secondary' }}>
                                {page * rowsPerPage + index + 1}
                              </TableCell>
                              <TableCell>{row.displayFolio ?? '—'}</TableCell>
                              <TableCell>{CONDUCTIVITY_TYPE_LABELS[row.type] ?? row.type}</TableCell>
                              <TableCell>{formatWeight(row.weightGrams)}</TableCell>
                              <TableCell>{formatConductivityZero(row.calculatedValue)}</TableCell>
                              <TableCell>{inRangeChip(row.inRange)}</TableCell>
                              <TableCell>{statusChip(row.status, isLocalRow)}</TableCell>
                              <TableCell>{isLocalRow ? '—' : createdLabel}</TableCell>
                              <TableCell>{row.reviewerName ?? '—'}</TableCell>
                              <TableCell>{formatDateDdMmYyyy(row.recordedAt)}</TableCell>
                              <TableCell align='center'>
                                <Stack direction='row' spacing={0.5} justifyContent='center'>
                                  {/* PDF only for confirmed server records */}
                                  {!isLocalRow ? (
                                    <Tooltip title='Descargar PDF'>
                                      <IconButton
                                        size='small'
                                        aria-label='PDF'
                                        onClick={() => void handleDownloadPdf(row.conductivityId)}
                                      >
                                        <Box component='i' className='ri-file-pdf-line' />
                                      </IconButton>
                                    </Tooltip>
                                  ) : null}
                                  {/* Edit: only Draft + server records */}
                                  {!isLocalRow && row.status === 'Draft' ? (
                                    <Tooltip title='Editar registro'>
                                      <IconButton
                                        size='small'
                                        color='default'
                                        aria-label='Editar'
                                        onClick={() => handleOpenEditDialog(row)}
                                      >
                                        <Box component='i' className='ri-edit-line' />
                                      </IconButton>
                                    </Tooltip>
                                  ) : null}
                                  {/* Delete: only Draft + server records */}
                                  {!isLocalRow && row.status === 'Draft' ? (
                                    <Tooltip title='Eliminar registro'>
                                      <IconButton
                                        size='small'
                                        color='error'
                                        aria-label='Eliminar'
                                        onClick={() => handleOpenDeleteConfirm(row)}
                                      >
                                        <Box component='i' className='ri-delete-bin-line' />
                                      </IconButton>
                                    </Tooltip>
                                  ) : null}
                                  {/* Review: only Draft + server records + TCM/TMC */}
                                  {myNomenclature && !isLocalRow && row.status === 'Draft' ? (
                                    <Tooltip title='Aprobar registro — requiere nomenclatura TCM o TMC' arrow>
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

      {/* ── Create dialog ─────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth='sm' PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>Nuevo registro</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {logbooksFromCache ? (
              <Alert severity='warning' sx={{ fontSize: '0.82rem' }}>
                Usando lista de bitácoras guardada. Sin conexión al servidor.
              </Alert>
            ) : null}
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

      {/* ── Edit dialog ───────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth='sm' PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
          Editar registro
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size='small'>
              <InputLabel id='edit-form-type-label'>Tipo</InputLabel>
              <Select<ConductivityType | ''>
                labelId='edit-form-type-label'
                label='Tipo'
                value={editFormType}
                onChange={(e: SelectChangeEvent<ConductivityType | ''>) => {
                  setEditFormError(null)
                  setEditFormType(e.target.value as ConductivityType | '')
                }}
              >
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
              value={editFormWeight}
              onChange={e => {
                setEditFormError(null)
                setEditFormWeight(e.target.value)
              }}
              inputProps={{ step: 0.0001, min: 0 }}
            />
            {logbooks.length > 0 ? (
              <FormControl fullWidth size='small'>
                <InputLabel id='edit-form-logbook-label'>Bitácora</InputLabel>
                <Select
                  labelId='edit-form-logbook-label'
                  label='Bitácora'
                  value={editFormLogbookId}
                  onChange={(e: SelectChangeEvent) => {
                    setEditFormError(null)
                    setEditFormLogbookId(e.target.value)
                  }}
                >
                  {logbooks.map(lb => (
                    <MenuItem key={lb.id} value={String(lb.id)}>
                      {lb.name} (ID {lb.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            <TextField
              fullWidth
              size='small'
              type='time'
              label='Hora de preparación'
              InputLabelProps={{ shrink: true }}
              value={editFormPreparationTime}
              onChange={e => setEditFormPreparationTime(e.target.value)}
            />
            <TextField
              fullWidth
              size='small'
              label='Observaciones'
              multiline
              rows={2}
              value={editFormObservation}
              onChange={e => setEditFormObservation(e.target.value)}
            />
          </Stack>
        </DialogContent>
        {editFormError ? (
          <Box sx={{ px: 3, pt: 0, pb: 1 }}>
            <Alert severity='error' onClose={() => setEditFormError(null)}>
              {editFormError}
            </Alert>
          </Box>
        ) : null}
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', px: 3, py: 2 }}>
          <Button variant='outlined' onClick={handleCloseEditDialog} disabled={editSubmitting}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            onClick={() => void handleUpdate()}
            disabled={!editFormValid || editSubmitting}
            startIcon={editSubmitting ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {editSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm dialog ─────────────────────────────────────────── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          if (deleteSubmitting) return
          setDeleteConfirmOpen(false)
          setDeleteRecord(null)
        }}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este registro de conductividad
            {deleteRecord?.displayFolio ? ` (${deleteRecord.displayFolio})` : ''}?
            {!isOnline
              ? ' Sin conexión, la eliminación se guardará en cola y se ejecutará al reconectar.'
              : ' Esta acción no se puede deshacer.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false)
              setDeleteRecord(null)
            }}
            disabled={deleteSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='error'
            disabled={deleteSubmitting}
            startIcon={deleteSubmitting ? <CircularProgress size={16} color='inherit' /> : null}
            onClick={() => void handleDelete()}
          >
            {deleteSubmitting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Review confirm dialog ─────────────────────────────────────────── */}
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
