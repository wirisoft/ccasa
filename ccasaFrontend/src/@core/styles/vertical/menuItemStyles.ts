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
      }
    },
    button: ({ active }) => ({
      paddingBlock: theme.spacing(1.5),
      '&:has(.MuiChip-root)': {
        paddingBlock: theme.spacing(1.5)
      },
      paddingInlineStart: theme.spacing(5.5),
      paddingInlineEnd: theme.spacing(3.5),
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      borderRadius: 0,
      ...(!active && {
        color: 'rgba(255, 255, 255, 0.72)',
        '&:hover, &:focus-visible': {
          backgroundColor: 'rgba(255, 255, 255, 0.06)'
        },
        '&[aria-expanded="true"]': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }
      }),
      ...(active && {
        [`&.${menuClasses.active}`]: {
          backgroundColor: 'rgba(21, 101, 192, 0.12)',
          color: '#1565C0',
          fontWeight: 600,
          borderLeft: '3px solid #1565C0',
          borderRadius: '0 8px 8px 0',
          boxShadow: 'none',
          '&:hover, &:focus-visible, &[aria-expanded="true"]': {
            backgroundColor: 'rgba(21, 101, 192, 0.16)'
          },
          [`& .${menuClasses.icon}`]: {
            color: '#1565C0'
          }
        }
      })
    }),
    icon: ({ level }) => ({
      ...(level === 0 && {
        fontSize: '1.375rem',
        marginInlineEnd: theme.spacing(2),
        color: 'rgba(255, 255, 255, 0.5)',
        flexShrink: 0
      }),
      ...(level > 0 && {
        fontSize: '0.75rem',
        color: 'var(--mui-palette-text-secondary)',
        marginInlineEnd: theme.spacing(3.5),
        flexShrink: 0
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
      flexShrink: 0,
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
