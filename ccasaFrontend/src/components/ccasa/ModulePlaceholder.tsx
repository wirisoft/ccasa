'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

// Config Imports
import type { BackendExtraEndpoint } from '@configs/backendApiRegistry'
import { ABSTRACT_CRUD_OPERATIONS } from '@configs/backendApiRegistry'

export type ModuleApiResourceBlock = {
  title?: string
  crudPath?: string
  controller?: string
  extras?: BackendExtraEndpoint[]
  notImplemented?: boolean
  footnote?: string
}

type ModulePlaceholderProps = {
  title: string
  description: string
  docRef?: string
  backHref?: string
  backLabel?: string

  /**
   * Bloques de API alineados con el backend (uno o varios controladores).
   * Si `crudPath` está definido y no es notImplemented, se muestra el patrón AbstractCrudController.
   */
  apiResources?: ModuleApiResourceBlock[]

  /** Referencias a EXCEL_ESPECIFICACIONES.md y ANALISIS_RESULTADOS_A_SOFTWARE.md (u otras) */
  documentationHints?: {
    excelEspecificaciones?: string
    analisisResultados?: string
  }
}

const ModulePlaceholder = (props: ModulePlaceholderProps) => {
  const {
    title,
    description,
    docRef,
    backHref = '/',
    backLabel = 'Volver al inicio',
    documentationHints,
    apiResources
  } = props

  const hasDocHints = documentationHints?.excelEspecificaciones || documentationHints?.analisisResultados

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={
          docRef ? (
            <Chip size='small' variant='outlined' label={docRef} className='mbs-1' component='span' />
          ) : undefined
        }
      />
      <CardContent className='flex flex-col gap-4'>
        <Typography color='text.secondary'>{description}</Typography>

        {apiResources && apiResources.length > 0 ? (
          <>
            <Divider className='mlb-1' />
            <Typography variant='subtitle2' color='text.primary'>
              API backend (ccasaBackend)
            </Typography>
            {apiResources.map((block, idx) => (
              <div key={idx} className='flex flex-col gap-2'>
                {block.title ? (
                  <Typography variant='body2' className='font-medium'>
                    {block.title}
                  </Typography>
                ) : null}
                {block.notImplemented ? (
                  <Typography variant='body2' color='warning.main'>
                    Sin controlador REST en el backend por ahora; previsto en documentación.
                  </Typography>
                ) : null}
                {block.crudPath ? (
                  <Typography variant='body2' color='text.secondary'>
                    Base CRUD:{' '}
                    <code className='text-xs bg-actionHover px-2 py-0.5 rounded'>{block.crudPath}</code>
                  </Typography>
                ) : null}
                {block.crudPath && !block.notImplemented ? (
                  <Typography variant='caption' color='text.disabled' display='block'>
                    {ABSTRACT_CRUD_OPERATIONS}
                  </Typography>
                ) : null}
                {block.controller ? (
                  <Typography variant='caption' color='text.disabled'>
                    Controlador: <code className='text-xs'>{block.controller}</code>
                  </Typography>
                ) : null}
                {block.extras && block.extras.length > 0 ? (
                  <div className='flex flex-col gap-1'>
                    <Typography variant='caption' color='text.secondary'>
                      Endpoints adicionales:
                    </Typography>
                    <ul className='text-sm text-textSecondary m-0 pis-4'>
                      {block.extras.map((ex, i) => (
                        <li key={i}>
                          <code className='text-xs'>{ex.method}</code> <code className='text-xs'>{ex.path}</code>
                          {' — '}
                          {ex.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {block.footnote ? (
                  <Typography variant='caption' color='text.disabled'>
                    {block.footnote}
                  </Typography>
                ) : null}
              </div>
            ))}
          </>
        ) : null}

        {hasDocHints ? (
          <>
            <Divider className='mlb-1' />
            <Typography variant='subtitle2' color='text.primary'>
              Trazabilidad documental (repo)
            </Typography>
            {documentationHints?.excelEspecificaciones ? (
              <div>
                <Button
                  component={Link}
                  href='/documentacion/excel-especificaciones'
                  size='small'
                  variant='text'
                  className='!pis-0 !mbe-1'
                >
                  EXCEL_ESPECIFICACIONES.md
                </Button>
                <Typography variant='body2' color='text.secondary'>
                  {documentationHints.excelEspecificaciones}
                </Typography>
              </div>
            ) : null}
            {documentationHints?.analisisResultados ? (
              <div>
                <Button
                  component={Link}
                  href='/documentacion/analisis-resultados-a-software'
                  size='small'
                  variant='text'
                  className='!pis-0 !mbe-1'
                >
                  ANALISIS_RESULTADOS_A_SOFTWARE.md
                </Button>
                <Typography variant='body2' color='text.secondary'>
                  {documentationHints.analisisResultados}
                </Typography>
              </div>
            ) : null}
          </>
        ) : null}
        <div>
          <Button component={Link} href={backHref} variant='outlined' color='primary' size='small'>
            {backLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ModulePlaceholder
