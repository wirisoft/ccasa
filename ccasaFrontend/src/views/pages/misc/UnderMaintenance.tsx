'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Type Imports
import type { Mode } from '@core/types'

const UnderMaintenance = ({ mode }: { mode: Mode }) => {
  void mode

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography variant='h4'>En mantenimiento 🚧</Typography>
          <Typography>
            Disculpa las molestias; en este momento estamos realizando tareas de mantenimiento. Vuelve a intentar más
            tarde.
          </Typography>
        </div>
        <Box
          aria-hidden
          sx={{
            fontSize: { xs: 140, md: 180 },
            color: 'warning.main',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className='ri-tools-line' />
        </Box>
        <Button href='/' component={Link} variant='contained'>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

export default UnderMaintenance
