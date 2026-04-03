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
import { SUPPORT_BACKEND } from '@configs/backendApiRegistry'

import { USER_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'users')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Empleados</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={s.label}
        subtitle={`${s.controllerHint} · CrudResponseDTO (mapa values por campo de entidad).`}
        apiPath={s.crudBasePath}
        fields={USER_CONFIG.fields}
        resourceLabel={USER_CONFIG.label}
        nameColumn='firstName'
      />
    </Stack>
  )
}

export default Page
