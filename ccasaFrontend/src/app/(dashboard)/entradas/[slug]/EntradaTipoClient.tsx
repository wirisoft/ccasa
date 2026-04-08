'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import ConductivityPanel from '@components/ccasa/ConductivityPanel'
import CrudListPanel from '@components/ccasa/CrudListPanel'
import DistilledWaterPanel from '@components/ccasa/DistilledWaterPanel'

// Config Imports
import { getEntradaModulo } from '@configs/ccasaModules'
import { getEntryConfigBySlug } from '@/lib/ccasa/crudFields'

type EntradaTipoClientProps = {
  slug: string
}

const EntradaTipoClient = ({ slug }: EntradaTipoClientProps) => {
  const mod = getEntradaModulo(slug)

  if (!mod) {
    return null
  }

  const entryConfig = getEntryConfigBySlug(slug)

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>{mod.label}</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Volver al inicio
        </Button>
      </div>

      {slug === 'conductividad' ? (
        <ConductivityPanel />
      ) : slug === 'agua-destilada' ? (
        <>
          <CrudListPanel
            title={`Registros — ${mod.label}`}
            apiPath={mod.backend.crudBasePath}
            {...(entryConfig ? { fields: entryConfig.fields, resourceLabel: entryConfig.label } : {})}
          />
          <DistilledWaterPanel />
        </>
      ) : (
        <CrudListPanel
          title={`Registros — ${mod.label}`}
          apiPath={mod.backend.crudBasePath}
          {...(entryConfig ? { fields: entryConfig.fields, resourceLabel: entryConfig.label } : {})}
        />
      )}
    </Stack>
  )
}

export default EntradaTipoClient
