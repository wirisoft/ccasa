import Link from 'next/link'

import type { Metadata } from 'next'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CrudListPanel from '@components/ccasa/CrudListPanel'
import { API_V1 } from '@configs/backendApiRegistry'
import { ENTRY_CORE_CONFIG } from '@/lib/ccasa/crudFields'

export const metadata: Metadata = {
  title: 'Entradas (núcleo) — BSA Lab'
}

const Page = () => (
  <Stack spacing={4}>
    <div className='flex items-center justify-between flex-wrap gap-2'>
      <div>
        <Typography variant='h5'>Entradas (núcleo)</Typography>
        <Typography variant='body2' color='text.secondary'>
          Vista general de todas las entradas del laboratorio. Para ver el detalle por bitácora, abre{' '}
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
      title='Entradas'
      apiPath={`${API_V1}/entries`}
      fields={ENTRY_CORE_CONFIG.fields}
      resourceLabel={ENTRY_CORE_CONFIG.label}
    />
  </Stack>
)

export default Page
