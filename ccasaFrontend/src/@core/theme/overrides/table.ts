// MUI Imports
import type { Theme } from '@mui/material/styles'

const table: Theme['components'] = {
  MuiTableContainer: {
    styleOverrides: {
      root: {
        borderRadius: 'var(--mui-shape-customBorderRadius-lg)',
        border: '1px solid var(--mui-palette-divider)',
        overflow: 'hidden'
      }
    }
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-root': {
          backgroundColor: 'var(--mui-palette-customColors-tableHeaderBg)',
          color: 'var(--mui-palette-text-secondary)',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '2px solid var(--mui-palette-divider)',
          whiteSpace: 'nowrap'
        }
      }
    }
  },
  MuiTableBody: {
    styleOverrides: {
      root: {
        '& .MuiTableRow-root': {
          '&:last-child .MuiTableCell-root': {
            borderBottom: 0
          },
          '&:hover': {
            backgroundColor: 'var(--mui-palette-action-hover)'
          }
        }
      }
    }
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(3, 4),
        fontSize: '0.8125rem',
        borderColor: 'var(--mui-palette-divider)'
      }),
      sizeSmall: ({ theme }) => ({
        padding: theme.spacing(2, 3)
      })
    }
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.15s ease'
      }
    }
  }
}

export default table
