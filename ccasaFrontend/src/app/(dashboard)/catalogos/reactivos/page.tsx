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
import { REAGENT_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  const c = getCatalogBackend('reagents')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Catálogo de reactivos</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        apiPath={REAGENT_CONFIG.apiPath}
        title={REAGENT_CONFIG.labelPlural}
        subtitle={c.controllerHint}
        fields={REAGENT_CONFIG.fields}
        resourceLabel={REAGENT_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
