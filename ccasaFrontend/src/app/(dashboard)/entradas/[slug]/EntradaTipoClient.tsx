'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getEntradaModulo } from '@configs/ccasaModules'
import { getEntryConfigBySlug } from '@/lib/ccasa/crudFields'

const ConductivityPanel = dynamic(
  () => import(/* webpackPrefetch: true */ '@/components/ccasa/ConductivityPanel'),
  {
    loading: () => <CircularProgress size={28} />
  }
)

const DistilledWaterPanel = dynamic(() => import('@/components/ccasa/DistilledWaterPanel'), {
  loading: () => <CircularProgress size={28} />
})

const CrudListPanel = dynamic(() => import('@/components/ccasa/CrudListPanel'), {
  loading: () => <CircularProgress size={28} />
})

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
      <div className='flex items-start justify-between flex-wrap gap-2'>
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: '1 1 240px' }}>
          <Typography variant='h5'>{mod.label}</Typography>
          {mod.pageDescription ? (
            <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 720 }}>
              {mod.pageDescription}
            </Typography>
          ) : null}
        </Stack>
        <Button component={Link} href='/' variant='outlined' size='small' sx={{ flexShrink: 0 }}>
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
