import type { Metadata } from 'next'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

export const metadata: Metadata = {
  title: 'Bitácoras — BSA Lab'
}

// Component Imports
import LogbooksPanel from '@components/ccasa/LogbooksPanel'

const BitacorasPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mbe-4'>
          Bitácoras
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <LogbooksPanel title='Listado de bitácoras' />
      </Grid>
    </Grid>
  )
}

export default BitacorasPage
