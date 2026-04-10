import Link from 'next/link'

import type { Metadata } from 'next'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CrudListPanel from '@components/ccasa/CrudListPanel'
import { REAGENT_CONFIG } from '@/lib/ccasa/crudFields'

export const metadata: Metadata = {
  title: 'Reactivos — BSA Lab'
}

const Page = () => {
  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Catálogo de reactivos</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        apiPath={REAGENT_CONFIG.apiPath}
        title={REAGENT_CONFIG.labelPlural}
        fields={REAGENT_CONFIG.fields}
        resourceLabel={REAGENT_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
