// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const AccountDelete = () => {
  return (
    <Card>
      <CardHeader title='Eliminar cuenta' />
      <CardContent className='flex flex-col items-start gap-6'>
        <Typography variant='body2' color='text.secondary'>
          ¿Estás seguro de que deseas desactivar tu cuenta?
        </Typography>
        <FormControlLabel control={<Checkbox />} label='Confirmo la desactivación de mi cuenta' />
        <Button variant='contained' color='error' type='submit'>
          Desactivar cuenta
        </Button>
      </CardContent>
    </Card>
  )
}

export default AccountDelete
