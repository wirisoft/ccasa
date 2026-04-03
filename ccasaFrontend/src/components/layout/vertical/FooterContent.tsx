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
        © 2026 CCASA Lab — Sistema de gestión de bitácoras de laboratorio
      </Typography>
    </div>
  )
}

export default FooterContent
