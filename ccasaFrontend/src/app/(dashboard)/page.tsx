'use client'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import LogbooksPanel from '@components/ccasa/LogbooksPanel'
import { useAuth } from '@/contexts/AuthContext'

type NavCard = {
  title: string
  description: string
  icon: string
  href: string
}

type NavLink = {
  title: string
  icon: string
  href: string
}

const baseNavCards: NavCard[] = [
  {
    title: 'Bitácoras',
    description: 'Gestión de bitácoras activas',
    icon: 'ri-book-2-line',
    href: '/bitacoras'
  },
  {
    title: 'Registros',
    description: 'Entradas por tipo',
    icon: 'ri-file-list-3-line',
    href: '/entradas/core'
  },
  {
    title: 'Catálogos',
    description: 'Reactivos, lotes y soluciones',
    icon: 'ri-flask-line',
    href: '/catalogos/reactivos'
  }
]

const personalCard: NavCard = {
  title: 'Personal',
  description: 'Empleados del laboratorio',
  icon: 'ri-team-line',
  href: '/empleados'
}

const baseNavigationLinks: NavLink[] = [
  { title: 'Folios', icon: 'ri-numbers-line', href: '/folios' },
  { title: 'Alertas', icon: 'ri-alarm-warning-line', href: '/alertas' },
  { title: 'Firmas', icon: 'ri-ball-pen-line', href: '/firmas' },
  { title: 'Lotes', icon: 'ri-stack-line', href: '/catalogos/lotes' },
  { title: 'Insumos', icon: 'ri-shopping-basket-line', href: '/catalogos/insumos' }
]

const rolesNavLink: NavLink = { title: 'Roles', icon: 'ri-shield-user-line', href: '/roles' }

const DashboardCcasa = () => {
  const { email, role } = useAuth()
  const isAdmin = role === 'Admin'

  const navCards: NavCard[] = [...baseNavCards, ...(isAdmin ? [personalCard] : [])]

  const navigation: NavLink[] = [
    baseNavigationLinks[0],
    baseNavigationLinks[1],
    baseNavigationLinks[2],
    ...(isAdmin ? [rolesNavLink] : []),
    baseNavigationLinks[3],
    baseNavigationLinks[4]
  ]

  return (
    <Grid container spacing={4}>
      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
          <div>
            <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
              Panel de control
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
              {email ? `Conectado como ${email}` : 'Sistema de gestión de bitácoras de laboratorio'}
            </Typography>
          </div>
        </Box>
      </Grid>

      {/* Module cards */}
      {navCards.map(section => (
        <Grid item xs={12} sm={6} md={3} key={section.title}>
          <Card
            component={Link}
            href={section.href}
            sx={{
              textDecoration: 'none',
              display: 'block',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 2px 8px rgba(21, 101, 192, 0.08)'
              }
            }}
          >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'action.hover',
                    flexShrink: 0
                  }}
                >
                  <i className={section.icon} style={{ fontSize: 22, color: 'var(--mui-palette-text-secondary)' }} />
                </Box>
                <div>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
                    {section.title}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                    {section.description}
                  </Typography>
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Main content */}
      <Grid item xs={12} lg={8}>
        <LogbooksPanel title='Bitácoras activas' />
      </Grid>

      {/* Navigation panel */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2, height: '100%' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Navegación
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {navigation.map((link, index) => (
              <Box
                key={link.title}
                component={Link}
                href={link.href}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  px: 1.5,
                  mx: -1.5,
                  borderRadius: 1.5,
                  textDecoration: 'none',
                  color: 'text.primary',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  ...(index < navigation.length - 1 && {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    mx: 0,
                    px: 0,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1.5,
                      mx: -1.5,
                      px: 1.5
                    }
                  })
                }}
              >
                <i className={link.icon} style={{ fontSize: 18, color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  {link.title}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardCcasa
