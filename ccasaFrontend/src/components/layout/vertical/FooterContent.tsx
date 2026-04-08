'use client'

// Third-party Imports
import classnames from 'classnames'
import Typography from '@mui/material/Typography'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.footerContent, 'flex items-center flex-wrap gap-4')}>
      <Typography variant='body2' color='text.secondary'>
        © {new Date().getFullYear()} Bitácoras Servicios Ambientales
      </Typography>
    </div>
  )
}

export default FooterContent
