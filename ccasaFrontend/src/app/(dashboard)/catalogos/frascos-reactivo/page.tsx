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
import { REAGENT_JAR_CONFIG } from '@/lib/ccasa/crudFields'

const Page = () => {
  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Frascos de reactivo</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={REAGENT_JAR_CONFIG.labelPlural}
        apiPath={REAGENT_JAR_CONFIG.apiPath}
        fields={REAGENT_JAR_CONFIG.fields}
        resourceLabel={REAGENT_JAR_CONFIG.label}
      />
    </Stack>
  )
}

export default Page
