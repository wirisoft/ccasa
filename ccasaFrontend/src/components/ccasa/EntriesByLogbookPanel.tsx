'use client'

// React Imports
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch, getErrorMessage } from '@/lib/ccasa/api'
import { formatDateDdMmYyyy } from '@/lib/ccasa/formatters'
import { ENTRY_STATUS_LABELS } from '@/lib/ccasa/crudDisplay'
import type { EntrySummaryDTO } from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

type EntriesByLogbookPanelProps = {
  logbookId: number
}

const EntriesByLogbookPanel = ({ logbookId }: EntriesByLogbookPanelProps) => {
  const { token } = useAuth()
  const [rows, setRows] = useState<EntrySummaryDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    setPage(0)
  }, [logbookId])

  useEffect(() => {
    if (!token || Number.isNaN(logbookId)) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await apiFetch<EntrySummaryDTO[]>(`/api/v1/entries/by-logbook/${logbookId}`)

        if (!cancelled) setRows(data)
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, 'Error al cargar entradas'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [token, logbookId])

  const paginatedRows = useMemo(() => {
    if (!rows) {
      return []
    }

    const start = page * rowsPerPage

    return rows.slice(start, start + rowsPerPage)
  }, [rows, page, rowsPerPage])

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  return (
    <Card>
      <CardHeader
        title={`Entradas — bitácora #${logbookId}`}
        action={
          <Button component={Link} href='/bitacoras' variant='outlined' size='small'>
            Volver a bitácoras
          </Button>
        }
      />
      <CardContent>
        {loading ? (
          <Box className='flex justify-center p-6'>
            <CircularProgress />
          </Box>
        ) : null}
        {error ? <Alert severity='error'>{error}</Alert> : null}
        {!loading && !error && rows ? (
          rows.length === 0 ? (
            <Typography color='text.secondary'>No hay entradas para esta bitácora.</Typography>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto', maxHeight: 440 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID entrada</TableCell>
                      <TableCell>Folio</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Registrado (UTC)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map(row => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.folioNumber}</TableCell>
                        <TableCell>{ENTRY_STATUS_LABELS[row.entryStatus] ?? row.entryStatus}</TableCell>
                        <TableCell>{formatDateDdMmYyyy(row.recordedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component='div'
                count={rows.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage='Filas por página:'
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              />
            </>
          )
        ) : null}
      </CardContent>
    </Card>
  )
}

export default EntriesByLogbookPanel
