'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import CrudListPanel from '@components/ccasa/CrudListPanel'

// Lib Imports
import { SUPPLY_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Insumos</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        apiPath={SUPPLY_CONFIG.apiPath}
        title={SUPPLY_CONFIG.labelPlural}
        fields={SUPPLY_CONFIG.fields}
        resourceLabel={SUPPLY_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
