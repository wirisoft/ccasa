'use client'

import Link from 'next/link'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CrudListPanel from '@components/ccasa/CrudListPanel'
import { REFERENCE_PARAMETER_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Configuración del laboratorio</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={REFERENCE_PARAMETER_CONFIG.labelPlural}
        apiPath={REFERENCE_PARAMETER_CONFIG.apiPath}
        fields={REFERENCE_PARAMETER_CONFIG.fields}
        resourceLabel={REFERENCE_PARAMETER_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
