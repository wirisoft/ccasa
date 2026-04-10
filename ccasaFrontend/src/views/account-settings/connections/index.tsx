'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'

type ConnectedAccountsType = {
  title: string
  iconClass: string
  checked: boolean
  subtitle: string
}

type SocialAccountsType = {
  title: string
  iconClass: string
  username?: string
  isConnected: boolean
  href?: string
}

const connectedAccountsArr: ConnectedAccountsType[] = [
  {
    checked: true,
    title: 'Google',
    iconClass: 'ri-google-fill',
    subtitle: 'Calendario y contactos'
  },
  {
    checked: false,
    title: 'Slack',
    iconClass: 'ri-slack-fill',
    subtitle: 'Comunicaciones'
  },
  {
    checked: true,
    title: 'Github',
    iconClass: 'ri-github-fill',
    subtitle: 'Gestiona tus repositorios Git'
  },
  {
    checked: true,
    title: 'Mailchimp',
    subtitle: 'Servicio de email marketing',
    iconClass: 'ri-mail-line'
  },
  {
    title: 'Asana',
    checked: false,
    subtitle: 'Comunicación de tareas',
    iconClass: 'ri-checkbox-circle-line'
  }
]

const socialAccountsArr: SocialAccountsType[] = [
  {
    title: 'Facebook',
    isConnected: false,
    iconClass: 'ri-facebook-fill'
  },
  {
    title: 'Twitter',
    isConnected: true,
    username: '@Theme_Selection',
    iconClass: 'ri-twitter-fill',
    href: 'https://twitter.com/Theme_Selection'
  },
  {
    title: 'Linkedin',
    isConnected: true,
    username: '@ThemeSelection',
    iconClass: 'ri-linkedin-fill',
    href: 'https://in.linkedin.com/company/themeselection'
  },
  {
    title: 'Dribbble',
    isConnected: false,
    iconClass: 'ri-dribbble-fill'
  },
  {
    title: 'Behance',
    isConnected: false,
    iconClass: 'ri-behance-fill'
  }
]

function BrandIcon({ className }: { className: string }) {
  return (
    <Box
      component='span'
      aria-hidden
      sx={{
        width: 32,
        height: 32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        color: 'text.primary',
        flexShrink: 0
      }}
    >
      <i className={className} />
    </Box>
  )
}

const Connections = () => {
  return (
    <Card>
      <Alert severity='info' sx={{ m: 2, mb: 0 }}>
        Próximamente: esta sección no está conectada al laboratorio.
      </Alert>
      <Grid container>
        <Grid item xs={12} md={6}>
          <CardHeader
            title='Cuentas conectadas'
            subheader='Muestra contenido de tus cuentas conectadas en el sitio'
          />
          <CardContent className='flex flex-col gap-4'>
            {connectedAccountsArr.map((item, index) => (
              <div key={index} className='flex items-center justify-between gap-4'>
                <div className='flex flex-grow items-center gap-4'>
                  <BrandIcon className={item.iconClass} />
                  <div className='flex-grow'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    <Typography variant='body2'>{item.subtitle}</Typography>
                  </div>
                </div>
                <Switch defaultChecked={item.checked} inputProps={{ 'aria-label': `Conectar ${item.title}` }} />
              </div>
            ))}
          </CardContent>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardHeader
            title='Redes sociales'
            subheader='Muestra contenido de tus redes sociales en el sitio'
          />
          <CardContent className='flex flex-col gap-4'>
            {socialAccountsArr.map((item, index) => (
              <div key={index} className='flex items-center justify-between gap-4'>
                <div className='flex flex-grow items-center gap-4'>
                  <BrandIcon className={item.iconClass} />
                  <div className='flex-grow'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    {item.isConnected ? (
                      <Typography
                        color='primary'
                        component={Link}
                        href={item.href || '/'}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {item.username}
                      </Typography>
                    ) : (
                      <Typography variant='body2'>Sin conexión</Typography>
                    )}
                  </div>
                </div>
                <CustomIconButton
                  variant='outlined'
                  color={item.isConnected ? 'error' : 'secondary'}
                  aria-label={item.isConnected ? `Desvincular ${item.title}` : `Vincular ${item.title}`}
                >
                  <i className={item.isConnected ? 'ri-delete-bin-7-line' : 'ri-links-line'} />
                </CustomIconButton>
              </div>
            ))}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Connections
