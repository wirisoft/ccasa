// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { MenuItemStyles } from '@menu/types'

// Util Imports
import { menuClasses } from '@menu/utils/menuClasses'

const menuItemStyles = (theme: Theme): MenuItemStyles => {
  return {
    root: {
      marginBlockStart: theme.spacing(0.25),
      [`&.${menuClasses.subMenuRoot}.${menuClasses.open} > .${menuClasses.button}, &.${menuClasses.subMenuRoot} > .${menuClasses.button}.${menuClasses.active}`]:
        {
          backgroundColor: 'rgba(255, 255, 255, 0.06) !important'
        },
      [`&.${menuClasses.disabled} > .${menuClasses.button}`]: {
        color: 'var(--mui-palette-text-disabled)',
        [`& .${menuClasses.icon}`]: {
          color: 'inherit'
        }
      },
      [`&:not(.${menuClasses.subMenuRoot}) > .${menuClasses.button}.${menuClasses.active}`]: {
        color: 'rgba(255, 255, 255, 0.92)',
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        boxShadow: `inset 3px 0 0 ${theme.palette.primary.light}`,
        [`& .${menuClasses.icon}`]: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    },
    button: ({ active }) => ({
      paddingBlock: theme.spacing(1.5),
      '&:has(.MuiChip-root)': {
        paddingBlock: theme.spacing(1.5)
      },
      paddingInlineStart: theme.spacing(5.5),
      paddingInlineEnd: theme.spacing(3.5),
      borderRadius: 0,
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
      ...(!active && {
        color: 'rgba(255, 255, 255, 0.72)',
        '&:hover, &:focus-visible': {
          backgroundColor: 'rgba(255, 255, 255, 0.06)'
        },
        '&[aria-expanded="true"]': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }
      })
    }),
    icon: ({ level }) => ({
      ...(level === 0 && {
        fontSize: '1.375rem',
        marginInlineEnd: theme.spacing(2),
        color: 'rgba(255, 255, 255, 0.5)'
      }),
      ...(level > 0 && {
        fontSize: '0.75rem',
        color: 'var(--mui-palette-text-secondary)',
        marginInlineEnd: theme.spacing(3.5)
      }),
      ...(level === 1 && {
        marginInlineStart: theme.spacing(1.5)
      }),
      ...(level > 1 && {
        marginInlineStart: theme.spacing(1.5 + 2.5 * (level - 1))
      }),
      '& > i, & > svg': {
        fontSize: 'inherit'
      }
    }),
    prefix: {
      marginInlineEnd: theme.spacing(2)
    },
    suffix: {
      marginInlineStart: theme.spacing(2)
    },
    subMenuExpandIcon: {
      fontSize: '1.375rem',
      marginInlineStart: theme.spacing(2),
      '& i, & svg': {
        fontSize: 'inherit'
      }
    },
    subMenuContent: {
      backgroundColor: 'transparent'
    }
  }
}

export default menuItemStyles
