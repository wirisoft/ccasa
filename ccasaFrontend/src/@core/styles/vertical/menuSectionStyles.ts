// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { MenuProps } from '@menu/vertical-menu'

// Util Imports
import { menuClasses } from '@menu/utils/menuClasses'

const menuSectionStyles = (theme: Theme): MenuProps['menuSectionStyles'] => {
  const isLight = theme.palette.mode === 'light'

  return {
    root: {
      marginBlockStart: theme.spacing(5),
      [`& .${menuClasses.menuSectionContent}`]: {
        color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.38)',
        paddingInline: '0 !important',
        paddingBlock: `${theme.spacing(1.5)} !important`,
        gap: 0,
        '&:before, &:after': {
          display: 'none'
        }
      },
      [`& .${menuClasses.menuSectionLabel}`]: {
        flexGrow: 0,
        fontSize: '0.6875rem',
        letterSpacing: '0.8px',
        fontWeight: 600,
        textTransform: 'uppercase',
        lineHeight: 1.4
      }
    }
  }
}

export default menuSectionStyles
