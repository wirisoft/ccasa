'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Config Imports
import { API_V1 } from '@configs/backendApiRegistry'
import { ENTRY_CORE_CONFIG } from '@/lib/ccasa/crudFields'

// Component Imports
import CrudListPanel from '@components/ccasa/CrudListPanel'

const Page = () => (
  <Stack spacing={4}>
    <div className='flex items-center justify-between flex-wrap gap-2'>
      <div>
        <Typography variant='h5'>Entradas (núcleo)</Typography>
        <Typography variant='body2' color='text.secondary'>
          Tabla genérica <code>Entry</code> vía EntryCrudController. Para resúmenes por bitácora usa la vista desde cada bitácora o{' '}
          <Button component={Link} href='/bitacoras' size='small' sx={{ verticalAlign: 'baseline' }}>
            Bitácoras
          </Button>
          .
        </Typography>
      </div>
      <Button component={Link} href='/' variant='outlined' size='small'>
        Inicio
      </Button>
    </div>
    <CrudListPanel
      title='Entry — CRUD'
      subtitle='CrudResponseDTO: campos dinámicos según entidad Entry en el backend.'
      apiPath={`${API_V1}/entries`}
      fields={ENTRY_CORE_CONFIG.fields}
      resourceLabel={ENTRY_CORE_CONFIG.label}
    />
  </Stack>
)

export default Page
