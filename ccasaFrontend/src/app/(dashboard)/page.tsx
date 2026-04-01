// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import LogbooksPanel from '@components/ccasa/LogbooksPanel'

// Config Imports
import { DOC_UI_ROUTES } from '@configs/ccasaDocumentation'

const docsEnApp = [
  {
    titulo: 'Excel — especificaciones',
    descripcion:
      'Hojas, columnas y mapeo a entidades para import/export y DTOs (docs/EXCEL_ESPECIFICACIONES.md).',
    href: DOC_UI_ROUTES.excelEspecificaciones,
    icon: 'ri-file-excel-2-line'
  },
  {
    titulo: 'Análisis → software',
    descripcion: 'Trazabilidad MER/Excel y roadmap por módulos (docs/ANALISIS_RESULTADOS_A_SOFTWARE.md).',
    href: DOC_UI_ROUTES.analisisResultados,
    icon: 'ri-git-repository-line'
  }
]

const DashboardCcasa = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mbe-2'>
          ccasa — Panel
        </Typography>
        <Typography color='text.secondary' className='mbe-6'>
          Datos en vivo desde el backend (<code className='text-sm'>NEXT_PUBLIC_API_BASE_URL</code>, por defecto{' '}
          <code className='text-sm'>http://localhost:8080</code>). Usuario de prueba tras arrancar el backend:{' '}
          <code className='text-sm'>admin@ccasa.local</code> / <code className='text-sm'>change-me</code>.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <LogbooksPanel title='Bitácoras (UI-01)' />
      </Grid>

      <Grid item xs={12}>
        <Typography variant='h6' className='mbe-4'>
          Documentación en la app
        </Typography>
        <Grid container spacing={4}>
          {docsEnApp.map(item => (
            <Grid item xs={12} md={6} key={item.href}>
              <Card variant='outlined' className='bs-full'>
                <CardContent className='flex flex-col gap-3'>
                  <div className='flex items-center gap-2'>
                    <i className={`${item.icon} text-2xl text-primary`} />
                    <Typography variant='h6'>{item.titulo}</Typography>
                  </div>
                  <Typography variant='body2' color='text.secondary'>
                    {item.descripcion}
                  </Typography>
                  <Button component={Link} href={item.href} variant='outlined' size='small'>
                    Abrir resumen
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default DashboardCcasa
