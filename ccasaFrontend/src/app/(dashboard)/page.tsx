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

const summaryCards = [
  {
    icon: 'ri-book-2-line',
    title: 'Bitácoras',
    subtitle: 'Gestión de bitácoras activas',
    href: '/bitacoras',
    cta: 'Ver bitácoras'
  },
  {
    icon: 'ri-file-list-3-line',
    title: 'Entradas',
    subtitle: 'Registros por tipo de entrada',
    href: '/entradas/core',
    cta: 'Ver entradas'
  },
  {
    icon: 'ri-flask-line',
    title: 'Catálogos',
    subtitle: 'Reactivos, lotes y soluciones',
    href: '/catalogos/reactivos',
    cta: 'Ver catálogos'
  },
  {
    icon: 'ri-team-line',
    title: 'Empleados',
    subtitle: 'Gestión de personal del laboratorio',
    href: '/empleados',
    cta: 'Ver empleados'
  }
] as const

const quickLinks = [
  { icon: 'ri-numbers-line', name: 'Folios y bloques', href: '/folios' },
  { icon: 'ri-alarm-warning-line', name: 'Alertas', href: '/alertas' },
  { icon: 'ri-ball-pen-line', name: 'Firmas', href: '/firmas' },
  { icon: 'ri-shield-user-line', name: 'Roles', href: '/roles' }
] as const

const DashboardCcasa = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mbe-2'>
          Panel de control
        </Typography>
        <Typography variant='body1' color='text.secondary' className='mbe-6'>
          Resumen del sistema de bitácoras del laboratorio.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={4}>
          {summaryCards.map(card => (
            <Grid item xs={12} sm={6} md={3} key={card.href}>
              <Card variant='outlined' className='bs-full'>
                <CardContent className='flex flex-col gap-3 p-6'>
                  <i className={`${card.icon} text-3xl text-primary`} />
                  <Typography variant='h6'>{card.title}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {card.subtitle}
                  </Typography>
                  <Button component={Link} href={card.href} variant='text' size='small' className='self-start'>
                    {card.cta}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <LogbooksPanel title='Bitácoras activas' />
      </Grid>

      <Grid item xs={12}>
        <Typography variant='h6' className='mbe-4'>
          Accesos rápidos
        </Typography>
        <Grid container spacing={4}>
          {quickLinks.map(link => (
            <Grid item xs={12} sm={6} md={3} key={link.href}>
              <Card variant='outlined' className='bs-full'>
                <CardContent className='flex flex-col gap-3 p-6'>
                  <div className='flex items-center gap-2'>
                    <i className={`${link.icon} text-2xl text-primary`} />
                    <Typography variant='subtitle1'>{link.name}</Typography>
                  </div>
                  <Button component={Link} href={link.href} variant='outlined' size='small' className='self-start'>
                    Abrir
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
