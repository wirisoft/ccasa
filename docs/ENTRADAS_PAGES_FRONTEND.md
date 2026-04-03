# Pantallas frontend: `src/app/(dashboard)/entradas/`

Documento generado con el contenido de las rutas de entradas por tipo (`[slug]`) y núcleo (`core`).

## Otros archivos en `entradas/`

Bajo `src/app/(dashboard)/entradas/` solo existen estos tres archivos (no hay `page.tsx` ni `layout.tsx` en la raíz de `entradas`, ni rutas adicionales fuera de `[slug]` y `core`).

---

## `ccasaFrontend/src/app/(dashboard)/entradas/[slug]/EntradaTipoClient.tsx`

```tsx
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

// Config Imports
import type { BackendExtraEndpoint } from '@configs/backendApiRegistry'
import { getEntradaModulo } from '@configs/ccasaModules'

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
      />

      {extraLines.length > 0 ? (
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
```

---

## `ccasaFrontend/src/app/(dashboard)/entradas/[slug]/page.tsx`

```tsx
import { notFound } from 'next/navigation'

// Component Imports
import EntradaTipoClient from './EntradaTipoClient'

// Config Imports
import { ENTRADA_SLUGS, getEntradaModulo } from '@configs/ccasaModules'

type PageProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return ENTRADA_SLUGS.map(slug => ({ slug }))
}

const EntradaTipoPage = ({ params }: PageProps) => {
  if (!getEntradaModulo(params.slug)) {
    notFound()
  }

  return <EntradaTipoClient slug={params.slug} />
}

export default EntradaTipoPage
```

---

## `ccasaFrontend/src/app/(dashboard)/entradas/core/page.tsx`

Pantalla de **Núcleo tabla Entry** (`EntryCrudController`).

```tsx
'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Config Imports
import { API_V1 } from '@configs/backendApiRegistry'

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
    />
  </Stack>
)

export default Page
```
