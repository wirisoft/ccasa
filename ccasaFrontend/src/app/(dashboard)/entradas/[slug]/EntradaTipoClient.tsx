'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import CrudListPanel from '@components/ccasa/CrudListPanel'
import DistilledWaterPanel from '@components/ccasa/DistilledWaterPanel'

// Config Imports
import type { BackendExtraEndpoint } from '@configs/backendApiRegistry'
import { getEntradaModulo } from '@configs/ccasaModules'
import { getEntryConfigBySlug } from '@/lib/ccasa/crudFields'

function extrasLines(extras: BackendExtraEndpoint[] | undefined): string[] {
  if (!extras?.length) return []

  return extras.map(e => `${e.method} ${e.path} — ${e.label}`)
}

type EntradaTipoClientProps = {
  slug: string
}

const EntradaTipoClient = ({ slug }: EntradaTipoClientProps) => {
  const mod = getEntradaModulo(slug)

  if (!mod) {
    return null
  }

  const entryConfig = getEntryConfigBySlug(slug)

  const extraLines = extrasLines(mod.backend.extraEndpoints)

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>{mod.label}</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Volver al inicio
        </Button>
      </div>

      <CrudListPanel
        title={`Listado — ${mod.backend.controllerCrud}`}
        subtitle={`CRUD genérico (CrudResponseDTO). ${mod.docRef}`}
        apiPath={mod.backend.crudBasePath}
        {...(entryConfig ? { fields: entryConfig.fields, resourceLabel: entryConfig.label } : {})}
      />

      {slug === 'agua-destilada' ? <DistilledWaterPanel /> : null}

      {slug !== 'agua-destilada' && extraLines.length > 0 ? (
        <Card variant='outlined'>
          <CardHeader title='Endpoints adicionales' titleTypographyProps={{ variant: 'subtitle1' }} />
          <CardContent>
            <Typography variant='body2' color='text.secondary' component='div'>
              <ul className='pli-4 m-0'>
                {extraLines.map(line => (
                  <li key={line} className='mbe-1'>
                    <code className='text-xs'>{line}</code>
                  </li>
                ))}
              </ul>
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <Card variant='outlined'>
        <CardHeader title='Trazabilidad documental' titleTypographyProps={{ variant: 'subtitle1' }} />
        <CardContent>
          <Typography variant='body2' color='text.secondary' className='mbe-2'>
            <strong>Excel / especificaciones:</strong> {mod.excelEspecificacionesHint}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            <strong>Análisis resultados → software:</strong> {mod.analisisResultadosHint}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default EntradaTipoClient
