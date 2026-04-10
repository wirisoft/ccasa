'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Type Imports
import type { Mode } from '@core/types'

const NotFound = ({ mode }: { mode: Mode }) => {
  void mode

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography className='font-medium text-8xl' color='text.primary'>
            404
          </Typography>
          <Typography variant='h4'>Página no encontrada ⚠️</Typography>
          <Typography>No pudimos encontrar la página que buscas.</Typography>
        </div>
        <Box
          aria-hidden
          sx={{
            fontSize: { xs: 140, md: 180 },
            color: 'text.secondary',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className='ri-error-warning-line' />
        </Box>
        <Button href='/' component={Link} variant='contained'>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

export default NotFound
