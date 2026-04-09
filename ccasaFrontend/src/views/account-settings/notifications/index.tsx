'use client'

// MUI Imports
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// Component Imports
import Link from '@components/Link'
import Form from '@components/Form'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type TableDataType = {
  type: string
  app: boolean
  email: boolean
  browser: boolean
}

// Vars
const tableData: TableDataType[] = [
  {
    app: true,
    email: true,
    browser: true,
    type: 'Novedades para ti'
  },
  {
    app: true,
    email: true,
    browser: true,
    type: 'Actividad de la cuenta'
  },
  {
    app: false,
    email: true,
    browser: true,
    type: 'Se usó un navegador nuevo para iniciar sesión'
  },
  {
    app: false,
    email: true,
    browser: false,
    type: 'Se vinculó un dispositivo nuevo'
  }
]

const Notifications = () => {
  return (
    <Card>
      <Alert severity='info' sx={{ m: 2, mb: 0 }}>
        Próximamente: esta sección no está conectada al laboratorio.
      </Alert>
      <CardHeader
        title='Dispositivos recientes'
        subheader={
          <>
            Necesitamos permiso del navegador para mostrar notificaciones.
            <Link className='text-primary'> Solicitar permiso</Link>
          </>
        }
      />
      <Form>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Correo</th>
                <th>Navegador</th>
                <th>App</th>
              </tr>
            </thead>
            <tbody className='border-be'>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td>
                    <Typography color='text.primary'>{data.type}</Typography>
                  </td>
                  <td>
                    <Checkbox defaultChecked={data.email} />
                  </td>
                  <td>
                    <Checkbox defaultChecked={data.browser} />
                  </td>
                  <td>
                    <Checkbox defaultChecked={data.app} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardContent>
          <Typography className='mbe-6 font-medium'>¿Cuándo debemos enviarte notificaciones?</Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6} md={4}>
              <Select fullWidth defaultValue='online'>
                <MenuItem value='online'>Solo cuando estoy en línea</MenuItem>
                <MenuItem value='anytime'>En cualquier momento</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                Guardar cambios
              </Button>
              <Button variant='outlined' color='secondary' type='reset'>
                Restablecer
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Form>
    </Card>
  )
}

export default Notifications
