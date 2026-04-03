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
import { ALERT_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'alerts')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Alertas</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={s.label}
        subtitle='Listado de alertas del sistema.'
        apiPath={s.crudBasePath}
        fields={ALERT_CONFIG.fields}
        resourceLabel={ALERT_CONFIG.label}
        nameColumn='type'
      />
    </Stack>
  )
}

export default Page
