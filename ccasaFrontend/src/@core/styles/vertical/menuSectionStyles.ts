// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { MenuProps } from '@menu/vertical-menu'

// Util Imports
import { menuClasses } from '@menu/utils/menuClasses'

const menuSectionStyles = (theme: Theme): MenuProps['menuSectionStyles'] => {
  return {
    root: {
      marginBlockStart: theme.spacing(5),
      [`& .${menuClasses.menuSectionContent}`]: {
        color: 'rgba(255, 255, 255, 0.38)',
        paddingInline: '0 !important',
        paddingBlock: `${theme.spacing(1.5)} !important`,
        gap: 0,
        '&:before, &:after': {
          display: 'none'
        }
      },
      [`& .${menuClasses.menuSectionLabel}`]: {
        flexGrow: 0,
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: 1.4
      }
    }
  }
}

export default menuSectionStyles
