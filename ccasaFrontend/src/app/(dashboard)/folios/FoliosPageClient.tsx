'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import CrudListPanel from '@components/ccasa/CrudListPanel'

// Lib Imports
import { FOLIO_BLOCK_CONFIG, FOLIO_CONFIG } from '@/lib/ccasa/crudFields'

const FoliosPageClient = () => (
  <Stack spacing={4}>
    <div className='flex items-center justify-between flex-wrap gap-2'>
      <Typography variant='h5'>Folios y bloques</Typography>
      <Button component={Link} href='/' variant='outlined' size='small'>
        Volver al inicio
      </Button>
    </div>

    <CrudListPanel
      apiPath={FOLIO_BLOCK_CONFIG.apiPath}
      title={FOLIO_BLOCK_CONFIG.labelPlural}
      fields={FOLIO_BLOCK_CONFIG.fields}
      resourceLabel={FOLIO_BLOCK_CONFIG.label}
      nameColumn='identifier'
    />

    <CrudListPanel
      apiPath={FOLIO_CONFIG.apiPath}
      title={FOLIO_CONFIG.labelPlural}
      fields={FOLIO_CONFIG.fields}
      resourceLabel={FOLIO_CONFIG.label}
      nameColumn='folioNumber'
    />
  </Stack>
)

export default FoliosPageClient
