import Link from 'next/link'

import type { Metadata } from 'next'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CrudListPanel from '@components/ccasa/CrudListPanel'
import { SUPPORT_BACKEND } from '@configs/backendApiRegistry'
import { SIGNATURE_CONFIG } from '@/lib/ccasa/crudFields'

export const metadata: Metadata = {
  title: 'Firmas — BSA Lab'
}

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'signatures')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Firmas</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={s.label}
        subtitle='Registros de firma asociados a entradas.'
        apiPath={s.crudBasePath}
        fields={SIGNATURE_CONFIG.fields}
        resourceLabel={SIGNATURE_CONFIG.label}
        nameColumn='signatureType'
      />
    </Stack>
  )
}

export default Page
