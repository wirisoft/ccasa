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

// Lib Imports
import { ROLE_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'roles')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Roles</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        apiPath={ROLE_CONFIG.apiPath}
        title={ROLE_CONFIG.labelPlural}
        subtitle={`${s.controllerHint} · catálogo de roles del laboratorio.`}
        fields={ROLE_CONFIG.fields}
        resourceLabel={ROLE_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
