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
import type { LogbookDTO } from '@/lib/ccasa/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

type LogbooksPanelProps = {
  title?: string
  showCard?: boolean
}

const LogbooksPanel = ({ title = 'Bitácoras activas', showCard = true }: LogbooksPanelProps) => {
  const { token } = useAuth()
  const [rows, setRows] = useState<LogbookDTO[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await apiFetch<LogbookDTO[]>('/api/v1/logbooks')

        if (!cancelled) setRows(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar bitácoras')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [token])

  const inner = (
    <>
      {loading ? (
        <Box className='flex justify-center p-6'>
          <CircularProgress />
        </Box>
      ) : null}
      {error ? (
        <Alert severity='error' className='m-4'>
          {error}
        </Alert>
      ) : null}
      {!loading && !error && rows ? (
        <>
          <Typography variant='body2' color='text.secondary' className='mbe-4'>
            Datos desde <code>GET /api/v1/logbooks</code> ({rows.length} registros).
          </Typography>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align='right'>Máx. entradas</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align='right'>{row.maxEntries}</TableCell>
                    <TableCell align='right'>
                      <Button component={Link} href={`/bitacoras/${row.id}`} size='small' variant='outlined'>
                        Ver entradas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </>
  )

  if (!showCard) {
    return inner
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>{inner}</CardContent>
    </Card>
  )
}

export default LogbooksPanel
