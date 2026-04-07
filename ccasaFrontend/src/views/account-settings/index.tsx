'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

const AccountSettings = ({ children }: { children: ReactNode }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {children}
      </Grid>
    </Grid>
  )
}

export default AccountSettings
