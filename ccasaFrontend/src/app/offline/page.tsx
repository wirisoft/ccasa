/**
 * Offline fallback page.
 * Served by the service worker when navigation fails and no cached page exists.
 * Informs the user their changes are safe in the local queue.
 *
 * @module offline/page
 */

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function OfflinePage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        px: 3,
        textAlign: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        component='i'
        className='ri-wifi-off-line'
        sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }}
      />
      <Typography variant='h5' fontWeight={600}>
        Sin conexión
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 420 }}>
        Tus cambios se guardan localmente y se enviarán al servidor en cuanto recuperes la conexión.
      </Typography>
      <Button variant='contained' href='/' sx={{ mt: 1 }}>
        Volver al inicio
      </Button>
    </Box>
  )
}
