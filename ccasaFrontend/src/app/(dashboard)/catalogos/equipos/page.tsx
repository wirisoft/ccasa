'use client'

import Link from 'next/link'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CrudListPanel from '@components/ccasa/CrudListPanel'
import { EQUIPMENT_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Equipos de laboratorio</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={EQUIPMENT_CONFIG.labelPlural}
        apiPath={EQUIPMENT_CONFIG.apiPath}
        fields={EQUIPMENT_CONFIG.fields}
        resourceLabel={EQUIPMENT_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
