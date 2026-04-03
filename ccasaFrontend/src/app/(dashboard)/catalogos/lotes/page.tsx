'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import CrudListPanel from '@components/ccasa/CrudListPanel'

// Config Imports
import { getCatalogBackend } from '@configs/backendApiRegistry'

// Lib Imports
import { BATCH_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  const c = getCatalogBackend('batches')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Lotes (batch)</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        apiPath={BATCH_CONFIG.apiPath}
        title={BATCH_CONFIG.labelPlural}
        subtitle={c.controllerHint}
        fields={BATCH_CONFIG.fields}
        resourceLabel={BATCH_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
