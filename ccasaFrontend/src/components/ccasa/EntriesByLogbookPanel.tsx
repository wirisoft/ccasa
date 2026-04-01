'use client'

// React Imports
import { useEffect, useState } from 'react'

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
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
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
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar entradas')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [token, logbookId])

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('es-MX', { timeZone: 'UTC' })
    } catch {
      return iso
    }
  }

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
        <Typography variant='body2' color='text.secondary' className='mbe-4'>
          <code>{`GET /api/v1/entries/by-logbook/${logbookId}`}</code>
        </Typography>
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
            <TableContainer>
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
                  {rows.map(row => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.folioNumber}</TableCell>
                      <TableCell>{row.entryStatus}</TableCell>
                      <TableCell>{formatDate(row.recordedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : null}
      </CardContent>
    </Card>
  )
}

export default EntriesByLogbookPanel
