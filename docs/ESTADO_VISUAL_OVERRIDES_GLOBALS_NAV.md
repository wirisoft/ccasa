# Estado visual: overrides MUI, `globals.css` y navegación vertical

Documento generado a partir del estado actual del frontend (`ccasaFrontend`). Rutas relativas al repositorio.

---

## Nota sobre la ruta de `Navigation`

No existe `src/@layouts/components/vertical/Navigation.tsx`. El sidebar vertical está en:

`ccasaFrontend/src/components/layout/vertical/Navigation.tsx`

---

## Estilos globales además de `globals.css`

En `src/app/layout.tsx` se importan globalmente:

- `react-perfect-scrollbar/dist/css/styles.css`
- `@/app/globals.css`
- `@assets/iconify-icons/generated-icons.css`

Otros archivos `.css` en el proyecto (por ejemplo `*.module.css`, `table.module.css`) son **locales** a componentes o módulos; no reemplazan a `globals.css` como hoja global de la aplicación.

---

## Sidebar: color de fondo

El fondo del contenedor del nav vertical **no** usa un token dedicado tipo `--sidebar-bg`. Se define en `ccasaFrontend/src/@core/styles/vertical/navigationCustomStyles.ts` con:

`backgroundColor: 'var(--mui-palette-background-default)'`

Es decir: **hereda del tema MUI** (`palette.background.default`). Para un sidebar distinto del resto de la app habría que cambiar ese estilo o añadir un color en el tema / variable CSS propia.

### Contenido completo: `ccasaFrontend/src/@core/styles/vertical/navigationCustomStyles.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

// Util Imports
import { menuClasses, verticalNavClasses } from '@menu/utils/menuClasses'

const navigationCustomStyles = (theme: Theme) => {
  return {
    color: 'var(--mui-palette-text-primary)',
    zIndex: 'var(--drawer-z-index) !important',
    [`& .${verticalNavClasses.bgColorContainer}`]: {
      backgroundColor: 'var(--mui-palette-background-default)'
    },
    [`& .${verticalNavClasses.header}`]: {
      paddingBlock: theme.spacing(5),
      paddingInline: theme.spacing(5.5, 4)
    },
    [`& .${verticalNavClasses.container}`]: {
      transition: 'none',
      borderColor: 'transparent',
      [`& .${verticalNavClasses.toggled}`]: {
        boxShadow: 'var(--mui-customShadows-lg)'
      }
    },
    [`& .${menuClasses.root}`]: {
      paddingBlockEnd: theme.spacing(2),
      paddingInlineEnd: theme.spacing(4)
    },
    [`& .${verticalNavClasses.backdrop}`]: {
      backgroundColor: 'var(--backdrop-color)'
    }
  }
}

export default navigationCustomStyles
```

---

## `ccasaFrontend/src/@core/theme/overrides/card.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Skin } from '@core/types'

const card = (skin: Skin): Theme['components'] => {
  return {
    MuiCard: {
      defaultProps: {
        ...(skin === 'bordered' && {
          variant: 'outlined'
        })
      },
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant !== 'outlined' && {
            boxShadow: 'var(--mui-customShadows-md)'
          })
        })
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          '& + .MuiCardContent-root, & + .MuiCardActions-root': {
            paddingBlockStart: 0
          },
          '& + .MuiCollapse-root .MuiCardContent-root:first-child, & + .MuiCollapse-root .MuiCardActions-root:first-child':
            {
              paddingBlockStart: 0
            }
        }),
        subheader: ({ theme }) => ({
          ...theme.typography.subtitle1,
          color: 'rgb(var(--mui-palette-text-primaryChannel) / 0.55)'
        }),
        action: ({ theme }) => ({
          ...theme.typography.body1,
          color: 'var(--mui-palette-text-disabled)',
          marginBlock: 0,
          marginInlineEnd: 0,
          '& .MuiIconButton-root': {
            color: 'inherit'
          }
        })
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          color: 'var(--mui-palette-text-secondary)',
          '&:last-child': {
            paddingBlockEnd: theme.spacing(5)
          },
          '& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root': {
            paddingBlockStart: 0
          },
          '& + .MuiCollapse-root .MuiCardHeader-root:first-child, & + .MuiCollapse-root .MuiCardContent-root:first-child, & + .MuiCollapse-root .MuiCardActions-root:first-child':
            {
              paddingBlockStart: 0
            }
        })
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          '&:where(.card-actions-dense)': {
            padding: theme.spacing(2.5),
            '& .MuiButton-text': {
              paddingInline: theme.spacing(2.5)
            }
          },
          '& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root': {
            paddingBlockStart: 0
          },
          '& + .MuiCollapse-root .MuiCardHeader-root:first-child, & + .MuiCollapse-root .MuiCardContent-root:first-child, & + .MuiCollapse-root .MuiCardActions-root:first-child':
            {
              paddingBlockStart: 0
            }
        })
      }
    }
  }
}

export default card
```

---

## `ccasaFrontend/src/@core/theme/overrides/table-pagination.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

const tablePagination: Theme['components'] = {
  MuiTablePagination: {
    styleOverrides: {
      toolbar: ({ theme }) => ({
        paddingInlineEnd: `${theme.spacing(3)} !important`
      }),
      select: ({ theme }) => ({
        ...theme.typography.body1,
        paddingInlineStart: 0,
        '& ~ i, & ~ svg': {
          fontSize: 20,
          right: '2px !important',
          color: 'var(--mui-palette-action-active)'
        }
      }),
      selectLabel: ({ theme }) => ({
        ...theme.typography.body1,
        color: 'var(--mui-palette-text-secondary)'
      }),
      input: ({ theme }) => ({
        marginInlineEnd: theme.spacing(6)
      }),
      displayedRows: ({ theme }) => ({
        ...theme.typography.body1
      }),
      actions: ({ theme }) => ({
        marginInlineStart: theme.spacing(6),
        '& .Mui-disabled': {
          color: 'var(--mui-palette-action-active)'
        },
        '& .MuiIconButton-root:last-of-type': {
          marginInlineStart: theme.spacing(2)
        }
      })
    }
  }
}

export default tablePagination
```

---

## `ccasaFrontend/src/@core/theme/overrides/input.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

const input: Theme['components'] = {
  MuiFormControl: {
    styleOverrides: {
      root: {
        '&:has(.MuiRadio-root) .MuiFormHelperText-root, &:has(.MuiCheckbox-root) .MuiFormHelperText-root, &:has(.MuiSwitch-root) .MuiFormHelperText-root':
          {
            marginInline: 0
          }
      }
    }
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        lineHeight: 1.6,
        '&.MuiInput-underline': {
          '&:before': {
            borderColor: 'var(--mui-palette-customColors-inputBorder)'
          },
          '&:not(.Mui-disabled, .Mui-error):hover:before': {
            borderColor: 'var(--mui-palette-action-active)'
          }
        },
        '&.Mui-disabled .MuiInputAdornment-root, &.Mui-disabled .MuiInputAdornment-root > *': {
          color: 'var(--mui-palette-action-disabled)'
        }
      }
    }
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        '&:before': {
          borderBottom: '1px solid var(--mui-palette-text-secondary)'
        },
        '&.Mui-disabled:before': {
          borderBottomStyle: 'solid'
        }
      }
    }
  },
  MuiInputLabel: {
    styleOverrides: {
      shrink: ({ ownerState }) => ({
        ...(ownerState.variant === 'outlined' && {
          color: 'var(--mui-palette-text-secondary)',
          transform: 'translate(14px, -8px) scale(0.867)'
        }),
        ...(ownerState.variant === 'filled' && {
          transform: 'translate(12px, 7px) scale(0.867)'
        }),
        ...(ownerState.variant === 'standard' && {
          transform: 'translate(0, -1.5px) scale(0.867)'
        })
      })
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        '&:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled):hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--mui-palette-action-active)'
        },
        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--mui-palette-action-disabledBackground)'
        }
      },
      input: ({ theme, ownerState }) => ({
        ...(ownerState?.size === 'medium' && {
          '&:not(.MuiInputBase-inputMultiline, .MuiInputBase-inputAdornedStart)': {
            paddingBlock: theme.spacing(4)
          },
          height: '1.5em'
        }),
        '& ~ .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--mui-palette-customColors-inputBorder)'
        }
      }),
      notchedOutline: {
        '& legend': {
          fontSize: '0.867em'
        }
      }
    }
  },
  MuiInputAdornment: {
    styleOverrides: {
      root: {
        color: 'var(--mui-palette-text-primary)',
        '& i, & svg': {
          fontSize: '1.25rem'
        },
        '& *': {
          color: 'inherit !important'
        }
      }
    }
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        lineHeight: 1,
        letterSpacing: 'unset'
      }
    }
  }
}

export default input
```

---

## `ccasaFrontend/src/@core/theme/overrides/button.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

// Config Imports
import themeConfig from '@configs/themeConfig'

const iconStyles = (size?: string) => ({
  '& > *:nth-of-type(1)': {
    ...(size === 'small'
      ? {
          fontSize: '14px'
        }
      : {
          ...(size === 'medium'
            ? {
                fontSize: '16px'
              }
            : {
                fontSize: '20px'
              })
        })
  }
})

const button: Theme['components'] = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: themeConfig.disableRipple
    }
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme, ownerState }) => ({
        ...(ownerState.variant === 'text'
          ? {
              ...(ownerState.size === 'small' && {
                padding: theme.spacing(2, 2.5)
              }),
              ...(ownerState.size === 'medium' && {
                padding: theme.spacing(2, 3.5)
              }),
              ...(ownerState.size === 'large' && {
                padding: theme.spacing(2, 4.5)
              })
            }
          : {
              ...(ownerState.variant === 'outlined'
                ? {
                    ...(ownerState.size === 'small' && {
                      padding: theme.spacing(1.75, 3.25)
                    }),
                    ...(ownerState.size === 'medium' && {
                      padding: theme.spacing(1.75, 4.25)
                    }),
                    ...(ownerState.size === 'large' && {
                      padding: theme.spacing(1.75, 5.25)
                    })
                  }
                : {
                    ...(ownerState.size === 'small' && {
                      padding: theme.spacing(2, 3.5)
                    }),
                    ...(ownerState.size === 'medium' && {
                      padding: theme.spacing(2, 4.5)
                    }),
                    ...(ownerState.size === 'large' && {
                      padding: theme.spacing(2, 5.5)
                    })
                  })
            })
      }),
      contained: ({ ownerState }) => ({
        boxShadow: 'var(--mui-customShadows-xs)',
        ...(!ownerState.disabled && {
          '&:hover, &.Mui-focusVisible': {
            boxShadow: 'var(--mui-customShadows-xs)'
          },
          '&:active': {
            boxShadow: 'none'
          }
        })
      }),
      sizeSmall: ({ theme }) => ({
        lineHeight: 1.38462,
        fontSize: theme.typography.body2.fontSize,
        borderRadius: 'var(--mui-shape-customBorderRadius-sm)'
      }),
      sizeLarge: {
        fontSize: '1.0625rem',
        lineHeight: 1.529412,
        borderRadius: 'var(--mui-shape-customBorderRadius-lg)'
      },
      startIcon: ({ theme, ownerState }) => ({
        ...(ownerState.size === 'small'
          ? {
              marginInlineEnd: theme.spacing(1.5)
            }
          : {
              ...(ownerState.size === 'medium'
                ? {
                    marginInlineEnd: theme.spacing(2)
                  }
                : {
                    marginInlineEnd: theme.spacing(2.5)
                  })
            }),
        ...iconStyles(ownerState.size)
      }),
      endIcon: ({ theme, ownerState }) => ({
        ...(ownerState.size === 'small'
          ? {
              marginInlineStart: theme.spacing(1.5)
            }
          : {
              ...(ownerState.size === 'medium'
                ? {
                    marginInlineStart: theme.spacing(2)
                  }
                : {
                    marginInlineStart: theme.spacing(2.5)
                  })
            }),
        ...iconStyles(ownerState.size)
      })
    },
    variants: [
      {
        props: { variant: 'text', color: 'primary' },
        style: {
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-primary-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-primary-main)'
          }
        }
      },
      {
        props: { variant: 'text', color: 'secondary' },
        style: {
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-secondary-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-secondary-main)'
          }
        }
      },
      {
        props: { variant: 'text', color: 'error' },
        style: {
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-error-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-error-main)'
          }
        }
      },
      {
        props: { variant: 'text', color: 'warning' },
        style: {
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-warning-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-warning-main)'
          }
        }
      },
      {
        props: { variant: 'text', color: 'info' },
        style: {
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-info-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-info-main)'
          }
        }
      },
      {
        props: { variant: 'text', color: 'success' },
        style: {
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-success-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-success-main)'
          }
        }
      },
      {
        props: { variant: 'outlined', color: 'primary' },
        style: {
          borderColor: 'var(--mui-palette-primary-main)',
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-primary-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-primary-main)',
            borderColor: 'var(--mui-palette-primary-main)'
          }
        }
      },
      {
        props: { variant: 'outlined', color: 'secondary' },
        style: {
          borderColor: 'var(--mui-palette-secondary-main)',
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-secondary-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-secondary-main)',
            borderColor: 'var(--mui-palette-secondary-main)'
          }
        }
      },
      {
        props: { variant: 'outlined', color: 'error' },
        style: {
          borderColor: 'var(--mui-palette-error-main)',
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-error-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-error-main)',
            borderColor: 'var(--mui-palette-error-main)'
          }
        }
      },
      {
        props: { variant: 'outlined', color: 'warning' },
        style: {
          borderColor: 'var(--mui-palette-warning-main)',
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-warning-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-warning-main)',
            borderColor: 'var(--mui-palette-warning-main)'
          }
        }
      },
      {
        props: { variant: 'outlined', color: 'info' },
        style: {
          borderColor: 'var(--mui-palette-info-main)',
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-info-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-info-main)',
            borderColor: 'var(--mui-palette-info-main)'
          }
        }
      },
      {
        props: { variant: 'outlined', color: 'success' },
        style: {
          borderColor: 'var(--mui-palette-success-main)',
          '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))':
            {
              backgroundColor: 'var(--mui-palette-success-lighterOpacity)'
            },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-success-main)',
            borderColor: 'var(--mui-palette-success-main)'
          }
        }
      },
      {
        props: { variant: 'contained', color: 'primary' },
        style: {
          '&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))': {
            backgroundColor: 'var(--mui-palette-primary-dark)'
          },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-primary-contrastText)',
            backgroundColor: 'var(--mui-palette-primary-main)'
          }
        }
      },
      {
        props: { variant: 'contained', color: 'secondary' },
        style: {
          '&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))': {
            backgroundColor: 'var(--mui-palette-secondary-dark)'
          },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-secondary-contrastText)',
            backgroundColor: 'var(--mui-palette-secondary-main)'
          }
        }
      },
      {
        props: { variant: 'contained', color: 'error' },
        style: {
          '&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))': {
            backgroundColor: 'var(--mui-palette-error-dark)'
          },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-error-contrastText)',
            backgroundColor: 'var(--mui-palette-error-main)'
          }
        }
      },
      {
        props: { variant: 'contained', color: 'warning' },
        style: {
          '&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))': {
            backgroundColor: 'var(--mui-palette-warning-dark)'
          },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-warning-contrastText)',
            backgroundColor: 'var(--mui-palette-warning-main)'
          }
        }
      },
      {
        props: { variant: 'contained', color: 'info' },
        style: {
          '&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))': {
            backgroundColor: 'var(--mui-palette-info-dark)'
          },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-info-contrastText)',
            backgroundColor: 'var(--mui-palette-info-main)'
          }
        }
      },
      {
        props: { variant: 'contained', color: 'success' },
        style: {
          '&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))': {
            backgroundColor: 'var(--mui-palette-success-dark)'
          },
          '&.Mui-disabled': {
            opacity: 0.45,
            color: 'var(--mui-palette-success-contrastText)',
            backgroundColor: 'var(--mui-palette-success-main)'
          }
        }
      }
    ]
  }
}

export default button
```

---

## `ccasaFrontend/src/@core/theme/overrides/dialog.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Skin } from '@core/types'

const dialog = (skin: Skin): Theme['components'] => ({
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        ...(skin !== 'bordered'
          ? {
              boxShadow: 'var(--mui-customShadows-xl)'
            }
          : {
              boxShadow: 'none'
            }),
        [theme.breakpoints.down('sm')]: {
          '&:not(.MuiDialog-paperFullScreen)': {
            margin: theme.spacing(6)
          }
        }
      })
    }
  },
  MuiDialogTitle: {
    defaultProps: {
      variant: 'h5'
    },
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(5),
        '& + .MuiDialogActions-root': {
          paddingTop: 0
        }
      })
    }
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(5),
        '& + .MuiDialogContent-root, & + .MuiDialogActions-root': {
          paddingTop: 0
        }
      })
    }
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(5),
        '& .MuiButtonBase-root:not(:first-of-type)': {
          marginInlineStart: theme.spacing(4)
        },
        '&:where(.dialog-actions-dense)': {
          padding: theme.spacing(2.5),
          '& .MuiButton-text': {
            paddingInline: theme.spacing(2.5)
          }
        }
      })
    }
  }
})

export default dialog
```

---

## `ccasaFrontend/src/@core/theme/overrides/chip.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

const chip: Theme['components'] = {
  MuiChip: {
    variants: [
      {
        props: { variant: 'tonal', color: 'primary' },
        style: {
          backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
          color: 'var(--mui-palette-primary-main)',
          '&.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-primary-mainOpacity)'
          },
          '& .MuiChip-deleteIcon': {
            color: 'rgb(var(--mui-palette-primary-mainChannel) / 0.7)',
            '&:hover': {
              color: 'var(--mui-palette-primary-main)'
            }
          },
          '&.MuiChip-clickable:hover': {
            backgroundColor: 'var(--mui-palette-primary-main)',
            color: 'var(--mui-palette-common-white)'
          }
        }
      },
      {
        props: { variant: 'tonal', color: 'secondary' },
        style: {
          backgroundColor: 'var(--mui-palette-secondary-lightOpacity)',
          color: 'var(--mui-palette-secondary-main)',
          '&.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-secondary-mainOpacity)'
          },
          '& .MuiChip-deleteIcon': {
            color: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.7)',
            '&:hover': {
              color: 'var(--mui-palette-secondary-main)'
            }
          },
          '&.MuiChip-clickable:hover': {
            backgroundColor: 'var(--mui-palette-secondary-main)',
            color: 'var(--mui-palette-common-white)'
          }
        }
      },
      {
        props: { variant: 'tonal', color: 'error' },
        style: {
          backgroundColor: 'var(--mui-palette-error-lightOpacity)',
          color: 'var(--mui-palette-error-main)',
          '&.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-error-mainOpacity)'
          },
          '& .MuiChip-deleteIcon': {
            color: 'rgb(var(--mui-palette-error-mainChannel) / 0.7)',
            '&:hover': {
              color: 'var(--mui-palette-error-main)'
            }
          },
          '&.MuiChip-clickable:hover': {
            backgroundColor: 'var(--mui-palette-error-main)',
            color: 'var(--mui-palette-common-white)'
          }
        }
      },
      {
        props: { variant: 'tonal', color: 'warning' },
        style: {
          backgroundColor: 'var(--mui-palette-warning-lightOpacity)',
          color: 'var(--mui-palette-warning-main)',
          '&.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-warning-mainOpacity)'
          },
          '& .MuiChip-deleteIcon': {
            color: 'rgb(var(--mui-palette-warning-mainChannel) / 0.7)',
            '&:hover': {
              color: 'var(--mui-palette-warning-main)'
            }
          },
          '&.MuiChip-clickable:hover': {
            backgroundColor: 'var(--mui-palette-warning-main)',
            color: 'var(--mui-palette-common-white)'
          }
        }
      },
      {
        props: { variant: 'tonal', color: 'info' },
        style: {
          backgroundColor: 'var(--mui-palette-info-lightOpacity)',
          color: 'var(--mui-palette-info-main)',
          '&.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-info-mainOpacity)'
          },
          '& .MuiChip-deleteIcon': {
            color: 'rgb(var(--mui-palette-info-mainChannel) / 0.7)',
            '&:hover': {
              color: 'var(--mui-palette-info-main)'
            }
          },
          '&.MuiChip-clickable:hover': {
            backgroundColor: 'var(--mui-palette-info-main)',
            color: 'var(--mui-palette-common-white)'
          }
        }
      },
      {
        props: { variant: 'tonal', color: 'success' },
        style: {
          backgroundColor: 'var(--mui-palette-success-lightOpacity)',
          color: 'var(--mui-palette-success-main)',
          '&.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-success-mainOpacity)'
          },
          '& .MuiChip-deleteIcon': {
            color: 'rgb(var(--mui-palette-success-mainChannel) / 0.7)',
            '&:hover': {
              color: 'var(--mui-palette-success-main)'
            }
          },
          '&.MuiChip-clickable:hover': {
            backgroundColor: 'var(--mui-palette-success-main)',
            color: 'var(--mui-palette-common-white)'
          }
        }
      }
    ],
    styleOverrides: {
      root: ({ ownerState, theme }) => ({
        ...theme.typography.body2,
        fontWeight: theme.typography.fontWeightMedium,

        '& .MuiChip-deleteIcon': {
          ...(ownerState.size === 'small'
            ? {
                fontSize: '1rem',
                marginInlineEnd: theme.spacing(1),
                marginInlineStart: theme.spacing(-2)
              }
            : {
                fontSize: '1.25rem',
                marginInlineEnd: theme.spacing(2),
                marginInlineStart: theme.spacing(-3)
              })
        },
        '& .MuiChip-avatar, & .MuiChip-icon': {
          '& i, & svg': {
            ...(ownerState.size === 'small'
              ? {
                  fontSize: 13
                }
              : {
                  fontSize: 15
                })
          },
          ...(ownerState.size === 'small'
            ? {
                height: 16,
                width: 16,
                marginInlineStart: theme.spacing(1),
                marginInlineEnd: theme.spacing(-2)
              }
            : {
                height: 20,
                width: 20,
                marginInlineStart: theme.spacing(2),
                marginInlineEnd: theme.spacing(-3)
              })
        }
      }),
      label: ({ ownerState, theme }) => ({
        ...(ownerState.size === 'small'
          ? {
              paddingInline: theme.spacing(3)
            }
          : {
              paddingInline: theme.spacing(4)
            })
      }),
      iconMedium: {
        fontSize: '1.25rem'
      },
      iconSmall: {
        fontSize: '1rem'
      }
    }
  }
}

export default chip
```

---

## `ccasaFrontend/src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --border-radius: var(--mui-shape-borderRadius);
  --border-color: var(--mui-palette-divider);
  --primary-color: var(--mui-palette-primary-main);
  --background-color: var(--mui-palette-background-default);
  --header-height: 64px;
  --header-z-index: var(--mui-zIndex-appBar);
  --footer-z-index: 10;
  --customizer-z-index: var(--mui-zIndex-drawer);
  --search-z-index: var(--mui-zIndex-tooltip);
  --drawer-z-index: var(--mui-zIndex-drawer);
  --backdrop-color: rgb(var(--mui-mainColorChannels-light) / 0.5);
}

[data-mui-color-scheme='dark'] {
  --backdrop-color: rgb(21 16 43 / 0.6);
}

*,
::before,
::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  border-width: 0;
  border-style: solid;
  border-color: theme('borderColor.DEFAULT', currentColor);
}

html {
  display: flex;
  inline-size: 100%;
  min-block-size: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

ul:not([class]) {
  margin-block: 1rem;
  padding-inline-start: 40px;
}

.ps__rail-y {
  inset-inline-end: 0 !important;
  inset-inline-start: auto !important;
  & .ps__thumb-y {
    inset-inline-end: 3px !important;
    inset-inline-start: auto !important;
    background-color: var(--mui-palette-divider);
    inline-size: 6px;
    &:hover,
    &:focus,
    &.ps--clicking {
      background-color: var(--mui-palette-action-disabled) !important;
    }
  }
  &:hover,
  &:focus,
  &.ps--clicking {
    background-color: var(--mui-palette-action-hover) !important;
  }
  &:hover,
  &:focus,
  &.ps--clicking {
    .ps__thumb-y {
      background-color: var(--mui-palette-action-disabled) !important;
    }
  }
}

.ts-vertical-nav-root {
  .ps__thumb-y {
    inline-size: 4px;
    &:hover,
    &:focus,
    &.ps--clicking {
      inline-size: 6px;
    }
  }
  .ps__rail-y {
    inline-size: 10px;
    &:hover,
    &:focus,
    &.ps--clicking {
      background-color: transparent !important;
      .ps__thumb-y {
        inline-size: 6px;
      }
    }
  }
}

:where([class^='ri-']) {
  font-size: 1.5rem;
}

code {
  font-family: inherit;
  padding-block: 2px;
  padding-inline: 4px;
  border-radius: 4px;
  font-size: 90%;
  color: var(--mui-palette-info-main);
  background-color: rgb(var(--mui-palette-info-mainChannel) / 0.08);
  border: 0;
}
```

---

## `ccasaFrontend/src/components/layout/vertical/Navigation.tsx`

(Sidebar vertical; sustituye la ruta histórica `src/@layouts/.../Navigation.tsx`, que no existe en este repo.)

```tsx
'use client'

// React Imports
import { useRef } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { styled, useTheme } from '@mui/material/styles'

// Component Imports
import VerticalNav, { NavHeader } from '@menu/vertical-menu'
import VerticalMenu from './VerticalMenu'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Style Imports
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-default) 5%, rgb(var(--mui-palette-background-defaultChannel) / 0.85) 30%, rgb(var(--mui-palette-background-defaultChannel) / 0.5) 65%, rgb(var(--mui-palette-background-defaultChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = () => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, toggleVerticalNav } = useVerticalNav()

  // Refs
  const shadowRef = useRef(null)

  const scrollMenu = (container: any, isPerfectScrollbar: boolean) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  return (
    // eslint-disable-next-line lines-around-comment
    // Sidebar Vertical Menu
    <VerticalNav customStyles={navigationCustomStyles(theme)}>
      {/* Nav Header including Logo & nav toggle icons  */}
      <NavHeader>
        <Link href='/'>
          <Logo />
        </Link>
        {isBreakpointReached && <i className='ri-close-line text-xl' onClick={() => toggleVerticalNav(false)} />}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <VerticalMenu scrollMenu={scrollMenu} />
    </VerticalNav>
  )
}

export default Navigation
```

---

## `ccasaFrontend/src/@menu/styles/vertical/StyledVerticalNavExpandIcon.tsx`

```tsx
// Third-party Imports
import styled from '@emotion/styled'

// Type Imports
import type { RootStylesType } from '../../types'
import type { VerticalMenuContextProps } from '../../components/vertical-menu/Menu'

type StyledVerticalNavExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

export const StyledVerticalNavExpandIconWrapper = styled.span<RootStylesType>`
  display: flex;
  margin-inline-start: 5px;
  ${({ rootStyles }) => rootStyles};
`

const StyledVerticalNavExpandIcon = styled.span<StyledVerticalNavExpandIconProps>`
  display: flex;

  & > i,
  & > svg {
    transition: ${({ transitionDuration }) => `transform ${transitionDuration}ms ease-in-out`};
    ${({ open }) => open && 'transform: rotate(90deg);'}

    [dir='rtl'] & {
      transform: rotate(180deg);
      ${({ open }) => open && 'transform: rotate(90deg);'}
    }
  }
`

export default StyledVerticalNavExpandIcon
```

---

## `ccasaFrontend/src/@core/styles/vertical/menuItemStyles.ts`

```typescript
// MUI Imports
import { lighten } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { MenuItemStyles } from '@menu/types'

// Util Imports
import { menuClasses } from '@menu/utils/menuClasses'

const menuItemStyles = (theme: Theme): MenuItemStyles => {
  return {
    root: {
      marginBlockStart: theme.spacing(1.5),
      [`&.${menuClasses.subMenuRoot}.${menuClasses.open} > .${menuClasses.button}, &.${menuClasses.subMenuRoot} > .${menuClasses.button}.${menuClasses.active}`]:
        {
          backgroundColor: 'var(--mui-palette-action-selected) !important'
        },
      [`&.${menuClasses.disabled} > .${menuClasses.button}`]: {
        color: 'var(--mui-palette-text-disabled)',
        [`& .${menuClasses.icon}`]: {
          color: 'inherit'
        }
      },
      [`&:not(.${menuClasses.subMenuRoot}) > .${menuClasses.button}.${menuClasses.active}`]: {
        color: 'var(--mui-palette-primary-contrastText)',
        background:
          theme.direction === 'ltr'
            ? `linear-gradient(270deg, var(--mui-palette-primary-main), ${lighten(
                theme.palette.primary.main,
                0.5
              )} 100%)`
            : `linear-gradient(270deg, ${lighten(
                theme.palette.primary.main,
                0.5
              )}, var(--mui-palette-primary-main) 100%)`,
        [`& .${menuClasses.icon}`]: {
          color: 'inherit'
        }
      }
    },
    button: ({ active }) => ({
      paddingBlock: theme.spacing(2),
      '&:has(.MuiChip-root)': {
        paddingBlock: theme.spacing(1.75)
      },
      paddingInlineStart: theme.spacing(5.5),
      paddingInlineEnd: theme.spacing(3.5),
      borderStartEndRadius: 50,
      borderEndEndRadius: 50,
      ...(!active && {
        '&:hover, &:focus-visible': {
          backgroundColor: 'var(--mui-palette-action-hover)'
        },
        '&[aria-expanded="true"]': {
          backgroundColor: 'var(--mui-palette-action-selected)'
        }
      })
    }),
    icon: ({ level }) => ({
      ...(level === 0 && {
        fontSize: '1.375rem',
        marginInlineEnd: theme.spacing(2)
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
```

---

## `ccasaFrontend/src/@core/styles/vertical/menuSectionStyles.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { MenuProps } from '@menu/vertical-menu'

// Util Imports
import { menuClasses } from '@menu/utils/menuClasses'

const menuSectionStyles = (theme: Theme): MenuProps['menuSectionStyles'] => {
  return {
    root: {
      marginBlockStart: theme.spacing(7),
      [`& .${menuClasses.menuSectionContent}`]: {
        color: 'var(--mui-palette-text-disabled)',
        paddingInline: '0 !important',
        paddingBlock: `${theme.spacing(1.75)} !important`,
        gap: theme.spacing(2.5),

        '&:before': {
          content: '""',
          blockSize: 1,
          inlineSize: '0.875rem',
          backgroundColor: 'var(--mui-palette-divider)'
        },
        '&:after': {
          content: '""',
          blockSize: 1,
          flexGrow: 1,
          backgroundColor: 'var(--mui-palette-divider)'
        }
      },
      [`& .${menuClasses.menuSectionLabel}`]: {
        flexGrow: 0,
        fontSize: '13px',
        lineHeight: 1.38462
      }
    }
  }
}

export default menuSectionStyles
```
