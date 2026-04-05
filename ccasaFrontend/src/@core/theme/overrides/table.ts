import type { Theme } from '@mui/material/styles'

const table: Theme['components'] = {
  MuiTableContainer: {
    styleOverrides: {
      root: {
        borderRadius: 8,
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
          fontSize: '0.6875rem',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.8px',
          borderBottom: '2px solid var(--mui-palette-divider)',
          whiteSpace: 'nowrap',
          paddingBlock: 12,
          paddingInline: 16
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
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }
        }
      }
    }
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        fontSize: '0.8125rem',
        paddingBlock: 12,
        paddingInline: 16,
        borderColor: 'var(--mui-palette-divider)'
      },
      sizeSmall: {
        paddingBlock: 8,
        paddingInline: 12
      }
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
