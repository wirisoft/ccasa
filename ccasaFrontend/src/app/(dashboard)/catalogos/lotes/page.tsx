import Link from 'next/link'

import type { Metadata } from 'next'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CrudListPanel from '@components/ccasa/CrudListPanel'
import { BATCH_CONFIG } from '@/lib/ccasa/crudFields'

export const metadata: Metadata = {
  title: 'Lotes — BSA Lab'
}

const Page = () => {
  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Lotes (batch)</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        apiPath={BATCH_CONFIG.apiPath}
        title={BATCH_CONFIG.labelPlural}
        fields={BATCH_CONFIG.fields}
        resourceLabel={BATCH_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
