# Configuración visual del frontend (ccasa)

Referencia de tema MUI, Tailwind, variables CSS y pantallas clave. Rutas relativas al directorio `ccasaFrontend/` salvo que se indique lo contrario.

**Nota:** No existen archivos sueltos `theme.ts` ni `palette.ts`. El tema se compone en `src/@core/theme/index.ts`; la paleta light/dark está en `colorSchemes.ts`. Los estilos por componente MUI viven en `src/@core/theme/overrides/` (varios archivos) y se agregan desde `overrides/index.ts`.

El ícono SVG del logo está en `src/@core/svg/Logo.tsx` (no incluido aquí; lo usa `components/layout/shared/Logo.tsx`).

---

## Estructura de `src/@core/theme/`

```
colorSchemes.ts
customShadows.ts
index.ts
shadows.ts
spacing.ts
typography.ts
overrides/
  accordion.tsx
  alerts.tsx
  autocomplete.tsx
  avatar.ts
  backdrop.ts
  badges.ts
  breadcrumbs.ts
  button-group.ts
  button.ts
  card.ts
  checkbox.tsx
  chip.ts
  dialog.ts
  drawer.ts
  fab.ts
  form-control-label.ts
  icon-button.ts
  index.ts
  input.ts
  list.ts
  menu.ts
  pagination.ts
  paper.ts
  popover.ts
  progress.ts
  radio.tsx
  rating.tsx
  select.tsx
  slider.ts
  snackbar.ts
  switch.ts
  table-pagination.ts
  tabs.ts
  timeline.ts
  toggle-button.ts
  tooltip.ts
  typography.ts
```

---

## `ccasaFrontend/src/@core/theme/index.ts`

```typescript
// Next Imports
import { Inter } from 'next/font/google'

// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { SystemMode } from '@core/types'

// Theme Options Imports
import overrides from './overrides'
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

const theme = (mode: SystemMode, direction: Theme['direction']): Theme => {
  return {
    direction,
    components: overrides(),
    colorSchemes: colorSchemes(),
    ...spacing,
    shape: {
      borderRadius: 6,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography(inter.style.fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '46 38 61',
      dark: '231 227 252',
      lightShadow: '46 38 61',
      darkShadow: '19 17 32'
    }
  } as Theme
}

export default theme
```

---

## `ccasaFrontend/src/@core/theme/colorSchemes.ts` (paleta MUI light / dark)

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

const colorSchemes = (): Theme['colorSchemes'] => {
  const skin = 'default' as string

  return {
    light: {
      palette: {
        primary: {
          main: '#8C57FF',
          light: '#A379FF',
          dark: '#7E4EE6',
          lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
        },
        secondary: {
          main: '#8A8D93',
          light: '#A1A4A9',
          dark: '#7C7F84',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
        },
        error: {
          main: '#FF4C51',
          light: '#FF7074',
          dark: '#E64449',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
        },
        warning: {
          main: '#FFB400',
          light: '#FFC333',
          dark: '#E6A200',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
        },
        info: {
          main: '#16B1FF',
          light: '#45C1FF',
          dark: '#149FE6',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
        },
        success: {
          main: '#56CA00',
          light: '#78D533',
          dark: '#4DB600',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.38)'
        },
        text: {
          primary: `rgb(var(--mui-mainColorChannels-light) / 0.9)`,
          secondary: `rgb(var(--mui-mainColorChannels-light) / 0.7)`,
          disabled: `rgb(var(--mui-mainColorChannels-light) / 0.4)`,
          primaryChannel: 'var(--mui-mainColorChannels-light)',
          secondaryChannel: 'var(--mui-mainColorChannels-light)'
        },
        divider: `rgb(var(--mui-mainColorChannels-light) / 0.12)`,
        dividerChannel: 'var(--mui-mainColorChannels-light)',
        background: {
          default: skin === 'bordered' ? '#FFFFFF' : '#F4F5FA',
          paper: '#FFFFFF'
        },
        action: {
          active: `rgb(var(--mui-mainColorChannels-light) / 0.6)`,
          hover: `rgb(var(--mui-mainColorChannels-light) / 0.04)`,
          selected: `rgb(var(--mui-mainColorChannels-light) / 0.08)`,
          disabled: `rgb(var(--mui-mainColorChannels-light) / 0.3)`,
          disabledBackground: `rgb(var(--mui-mainColorChannels-light) / 0.12)`,
          focus: `rgb(var(--mui-mainColorChannels-light) / 0.1)`,
          focusOpacity: 0.1,
          activeChannel: 'var(--mui-mainColorChannels-light)',
          selectedChannel: 'var(--mui-mainColorChannels-light)'
        },
        Alert: {
          errorColor: 'var(--mui-palette-error-main)',
          warningColor: 'var(--mui-palette-warning-main)',
          infoColor: 'var(--mui-palette-info-main)',
          successColor: 'var(--mui-palette-success-main)',
          errorStandardBg: 'var(--mui-palette-error-lightOpacity)',
          warningStandardBg: 'var(--mui-palette-warning-lightOpacity)',
          infoStandardBg: 'var(--mui-palette-info-lightOpacity)',
          successStandardBg: 'var(--mui-palette-success-lightOpacity)',
          errorFilledColor: 'var(--mui-palette-error-contrastText)',
          warningFilledColor: 'var(--mui-palette-warning-contrastText)',
          infoFilledColor: 'var(--mui-palette-info-contrastText)',
          successFilledColor: 'var(--mui-palette-success-contrastText)',
          errorFilledBg: 'var(--mui-palette-error-main)',
          warningFilledBg: 'var(--mui-palette-warning-main)',
          infoFilledBg: 'var(--mui-palette-info-main)',
          successFilledBg: 'var(--mui-palette-success-main)'
        },
        Avatar: {
          defaultBg: '#F0EFF0'
        },
        Chip: {
          defaultBorder: 'var(--mui-palette-divider)'
        },
        FilledInput: {
          bg: `rgb(var(--mui-mainColorChannels-light) / 0.06)`,
          hoverBg: `rgb(var(--mui-mainColorChannels-light) / 0.08)`,
          disabledBg: `rgb(var(--mui-mainColorChannels-light) / 0.06)`
        },
        LinearProgress: {
          primaryBg: 'var(--mui-palette-primary-mainOpacity)',
          secondaryBg: 'var(--mui-palette-secondary-mainOpacity)',
          errorBg: 'var(--mui-palette-error-mainOpacity)',
          warningBg: 'var(--mui-palette-warning-mainOpacity)',
          infoBg: 'var(--mui-palette-info-mainOpacity)',
          successBg: 'var(--mui-palette-success-mainOpacity)'
        },
        SnackbarContent: {
          bg: '#1A0E33',
          color: 'var(--mui-palette-background-paper)'
        },
        Switch: {
          defaultColor: 'var(--mui-palette-common-white)',
          defaultDisabledColor: 'var(--mui-palette-common-white)',
          primaryDisabledColor: 'var(--mui-palette-common-white)',
          secondaryDisabledColor: 'var(--mui-palette-common-white)',
          errorDisabledColor: 'var(--mui-palette-common-white)',
          warningDisabledColor: 'var(--mui-palette-common-white)',
          infoDisabledColor: 'var(--mui-palette-common-white)',
          successDisabledColor: 'var(--mui-palette-common-white)'
        },
        Tooltip: {
          bg: '#1A0E33'
        },
        TableCell: {
          border: 'var(--mui-palette-divider)'
        },
        customColors: {
          bodyBg: '#F4F5FA',
          chatBg: '#F7F6FA',
          greyLightBg: '#FAFAFA',
          inputBorder: `rgb(var(--mui-mainColorChannels-light) / 0.22)`,
          tableHeaderBg: '#F6F7FB',
          tooltipText: '#FFFFFF',
          trackBg: '#F0F2F8'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#8C57FF',
          light: '#A379FF',
          dark: '#7E4EE6',
          lighterOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-primary-mainChannel) / 0.38)'
        },
        secondary: {
          main: '#8A8D93',
          light: '#A1A4A9',
          dark: '#7C7F84',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-secondary-mainChannel) / 0.38)'
        },
        error: {
          main: '#FF4C51',
          light: '#FF7074',
          dark: '#E64449',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-error-mainChannel) / 0.38)'
        },
        warning: {
          main: '#FFB400',
          light: '#FFC333',
          dark: '#E6A200',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-warning-mainChannel) / 0.38)'
        },
        info: {
          main: '#16B1FF',
          light: '#45C1FF',
          dark: '#149FE6',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-info-mainChannel) / 0.38)'
        },
        success: {
          main: '#56CA00',
          light: '#78D533',
          dark: '#4DB600',
          contrastText: '#fff',
          lighterOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.08)',
          lightOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.16)',
          mainOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.24)',
          darkOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.32)',
          darkerOpacity: 'rgb(var(--mui-palette-success-mainChannel) / 0.38)'
        },
        text: {
          primary: `rgb(var(--mui-mainColorChannels-dark) / 0.9)`,
          secondary: `rgb(var(--mui-mainColorChannels-dark) / 0.7)`,
          disabled: `rgb(var(--mui-mainColorChannels-dark) / 0.4)`,
          primaryChannel: 'var(--mui-mainColorChannels-dark)',
          secondaryChannel: 'var(--mui-mainColorChannels-dark)'
        },
        divider: `rgb(var(--mui-mainColorChannels-dark) / 0.12)`,
        dividerChannel: 'var(--mui-mainColorChannels-dark)',
        background: {
          default: skin === 'bordered' ? '#312D4B' : '#28243D',
          paper: '#312D4B'
        },
        action: {
          active: `rgb(var(--mui-mainColorChannels-dark) / 0.6)`,
          hover: `rgb(var(--mui-mainColorChannels-dark) / 0.04)`,
          selected: `rgb(var(--mui-mainColorChannels-dark) / 0.08)`,
          disabled: `rgb(var(--mui-mainColorChannels-dark) / 0.3)`,
          disabledBackground: `rgb(var(--mui-mainColorChannels-dark) / 0.12)`,
          focus: `rgb(var(--mui-mainColorChannels-dark) / 0.1)`,
          focusOpacity: 0.1,
          activeChannel: 'var(--mui-mainColorChannels-dark)',
          selectedChannel: 'var(--mui-mainColorChannels-dark)'
        },
        Alert: {
          errorColor: 'var(--mui-palette-error-main)',
          warningColor: 'var(--mui-palette-warning-main)',
          infoColor: 'var(--mui-palette-info-main)',
          successColor: 'var(--mui-palette-success-main)',
          errorStandardBg: 'var(--mui-palette-error-lightOpacity)',
          warningStandardBg: 'var(--mui-palette-warning-lightOpacity)',
          infoStandardBg: 'var(--mui-palette-info-lightOpacity)',
          successStandardBg: 'var(--mui-palette-success-lightOpacity)',
          errorFilledColor: 'var(--mui-palette-error-contrastText)',
          warningFilledColor: 'var(--mui-palette-warning-contrastText)',
          infoFilledColor: 'var(--mui-palette-info-contrastText)',
          successFilledColor: 'var(--mui-palette-success-contrastText)',
          errorFilledBg: 'var(--mui-palette-error-main)',
          warningFilledBg: 'var(--mui-palette-warning-main)',
          infoFilledBg: 'var(--mui-palette-info-main)',
          successFilledBg: 'var(--mui-palette-success-main)'
        },
        Avatar: {
          defaultBg: '#3F3B59'
        },
        Chip: {
          defaultBorder: 'var(--mui-palette-divider)'
        },
        FilledInput: {
          bg: `rgb(var(--mui-mainColorChannels-dark) / 0.06)`,
          hoverBg: `rgb(var(--mui-mainColorChannels-dark) / 0.08)`,
          disabledBg: `rgb(var(--mui-mainColorChannels-dark) / 0.06)`
        },
        LinearProgress: {
          primaryBg: 'var(--mui-palette-primary-mainOpacity)',
          secondaryBg: 'var(--mui-palette-secondary-mainOpacity)',
          errorBg: 'var(--mui-palette-error-mainOpacity)',
          warningBg: 'var(--mui-palette-warning-mainOpacity)',
          infoBg: 'var(--mui-palette-info-mainOpacity)',
          successBg: 'var(--mui-palette-success-mainOpacity)'
        },
        SnackbarContent: {
          bg: '#F7F4FF',
          color: 'var(--mui-palette-background-paper)'
        },
        Switch: {
          defaultColor: 'var(--mui-palette-common-white)',
          defaultDisabledColor: 'var(--mui-palette-common-white)',
          primaryDisabledColor: 'var(--mui-palette-common-white)',
          secondaryDisabledColor: 'var(--mui-palette-common-white)',
          errorDisabledColor: 'var(--mui-palette-common-white)',
          warningDisabledColor: 'var(--mui-palette-common-white)',
          infoDisabledColor: 'var(--mui-palette-common-white)',
          successDisabledColor: 'var(--mui-palette-common-white)'
        },
        Tooltip: {
          bg: '#F7F4FF'
        },
        TableCell: {
          border: 'var(--mui-palette-divider)'
        },
        customColors: {
          bodyBg: '#28243D',
          chatBg: '#373452',
          greyLightBg: '#373350',
          inputBorder: `rgb(var(--mui-mainColorChannels-dark) / 0.22)`,
          tableHeaderBg: '#3D3759',
          tooltipText: '#312D4B',
          trackBg: '#474360'
        }
      }
    }
  } as Theme['colorSchemes']
}

export default colorSchemes
```

---

## `ccasaFrontend/src/@core/theme/typography.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

const typography = (fontFamily: string): Theme['typography'] =>
  ({
    fontFamily:
      typeof fontFamily === 'undefined' || fontFamily === ''
        ? [
            'Inter',
            'sans-serif',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"'
          ].join(',')
        : fontFamily,
    fontSize: 13.125,
    h1: {
      fontSize: '2.875rem',
      fontWeight: 500,
      lineHeight: 1.478261
    },
    h2: {
      fontSize: '2.375rem',
      fontWeight: 500,
      lineHeight: 1.47368421
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.58334
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.5556
    },
    h6: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.46667
    },
    subtitle1: {
      fontSize: '0.9375rem',
      lineHeight: 1.46667
    },
    subtitle2: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.53846154
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.46667
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.53846154
    },
    button: {
      fontSize: '0.9375rem',
      lineHeight: 1.46667,
      textTransform: 'none'
    },
    caption: {
      fontSize: '0.8125rem',
      lineHeight: 1.38462,
      letterSpacing: '0.4px'
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.16667,
      letterSpacing: '0.8px'
    }
  }) as Theme['typography']

export default typography
```

---

## `ccasaFrontend/src/@core/theme/spacing.ts`

```typescript
const spacing = {
  spacing: (factor: number) => `${0.25 * factor}rem`
}

export default spacing
```

---

## `ccasaFrontend/src/@core/theme/shadows.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { SystemMode } from '@core/types'

const shadows = (mode: SystemMode): Theme['shadows'] => {
  const color = `var(--mui-mainColorChannels-${mode}Shadow)`

  return [
    'none',
    `0px 2px 1px -1px rgb(${color} / 0.2),0px 1px 1px 0px rgb(${color} / 0.14),0px 1px 3px 0px rgb(${color} / 0.12)`,
    `0px 3px 1px -2px rgb(${color} / 0.2),0px 2px 2px 0px rgb(${color} / 0.14),0px 1px 5px 0px rgb(${color} / 0.12)`,
    `0px 3px 3px -2px rgb(${color} / 0.2),0px 3px 4px 0px rgb(${color} / 0.14),0px 1px 8px 0px rgb(${color} / 0.12)`,
    `0px 2px 4px -1px rgb(${color} / 0.2),0px 4px 5px 0px rgb(${color} / 0.14),0px 1px 10px 0px rgb(${color} / 0.12)`,
    `0px 3px 5px -1px rgb(${color} / 0.2),0px 5px 8px 0px rgb(${color} / 0.14),0px 1px 14px 0px rgb(${color} / 0.12)`,
    `0px 3px 5px -1px rgb(${color} / 0.2),0px 6px 10px 0px rgb(${color} / 0.14),0px 1px 18px 0px rgb(${color} / 0.12)`,
    `0px 4px 5px -2px rgb(${color} / 0.2),0px 7px 10px 1px rgb(${color} / 0.14),0px 2px 16px 1px rgb(${color} / 0.12)`,
    `0px 5px 5px -3px rgb(${color} / 0.2),0px 8px 10px 1px rgb(${color} / 0.14),0px 3px 14px 2px rgb(${color} / 0.12)`,
    `0px 5px 6px -3px rgb(${color} / 0.2),0px 9px 12px 1px rgb(${color} / 0.14),0px 3px 16px 2px rgb(${color} / 0.12)`,
    `0px 6px 6px -3px rgb(${color} / 0.2),0px 10px 14px 1px rgb(${color} / 0.14),0px 4px 18px 3px rgb(${color} / 0.12)`,
    `0px 6px 7px -4px rgb(${color} / 0.2),0px 11px 15px 1px rgb(${color} / 0.14),0px 4px 20px 3px rgb(${color} / 0.12)`,
    `0px 7px 8px -4px rgb(${color} / 0.2),0px 12px 17px 2px rgb(${color} / 0.14),0px 5px 22px 4px rgb(${color} / 0.12)`,
    `0px 7px 8px -4px rgb(${color} / 0.2),0px 13px 19px 2px rgb(${color} / 0.14),0px 5px 24px 4px rgb(${color} / 0.12)`,
    `0px 7px 9px -4px rgb(${color} / 0.2),0px 14px 21px 2px rgb(${color} / 0.14),0px 5px 26px 4px rgb(${color} / 0.12)`,
    `0px 8px 9px -5px rgb(${color} / 0.2),0px 15px 22px 2px rgb(${color} / 0.14),0px 6px 28px 5px rgb(${color} / 0.12)`,
    `0px 8px 10px -5px rgb(${color} / 0.2),0px 16px 24px 2px rgb(${color} / 0.14),0px 6px 30px 5px rgb(${color} / 0.12)`,
    `0px 8px 11px -5px rgb(${color} / 0.2),0px 17px 26px 2px rgb(${color} / 0.14),0px 6px 32px 5px rgb(${color} / 0.12)`,
    `0px 9px 11px -5px rgb(${color} / 0.2),0px 18px 28px 2px rgb(${color} / 0.14),0px 7px 34px 6px rgb(${color} / 0.12)`,
    `0px 9px 12px -6px rgb(${color} / 0.2),0px 19px 29px 2px rgb(${color} / 0.14),0px 7px 36px 6px rgb(${color} / 0.12)`,
    `0px 10px 13px -6px rgb(${color} / 0.2),0px 20px 31px 3px rgb(${color} / 0.14),0px 8px 38px 7px rgb(${color} / 0.12)`,
    `0px 10px 13px -6px rgb(${color} / 0.2),0px 21px 33px 3px rgb(${color} / 0.14),0px 8px 40px 7px rgb(${color} / 0.12)`,
    `0px 10px 14px -6px rgb(${color} / 0.2),0px 22px 35px 3px rgb(${color} / 0.14),0px 8px 42px 7px rgb(${color} / 0.12)`,
    `0px 11px 14px -7px rgb(${color} / 0.2),0px 23px 36px 3px rgb(${color} / 0.14),0px 9px 44px 8px rgb(${color} / 0.12)`,
    `0px 11px 15px -7px rgb(${color} / 0.2),0px 24px 38px 3px rgb(${color} / 0.14),0px 9px 46px 8px rgb(${color} / 0.12)`
  ]
}

export default shadows
```

---

## `ccasaFrontend/src/@core/theme/customShadows.ts`

```typescript
// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { SystemMode } from '@core/types'

const customShadows = (mode: SystemMode): Theme['customShadows'] => {
  return {
    xs: `0px 2px 4px rgb(var(--mui-mainColorChannels-${mode}Shadow) / ${mode === 'light' ? 0.16 : 0.2})`,
    sm: `0px 3px 6px rgb(var(--mui-mainColorChannels-${mode}Shadow) / ${mode === 'light' ? 0.18 : 0.22})`,
    md: `0px 4px 10px rgb(var(--mui-mainColorChannels-${mode}Shadow) / ${mode === 'light' ? 0.2 : 0.24})`,
    lg: `0px 6px 16px rgb(var(--mui-mainColorChannels-${mode}Shadow) / ${mode === 'light' ? 0.22 : 0.26})`,
    xl: `0px 8px 28px rgb(var(--mui-mainColorChannels-${mode}Shadow) / ${mode === 'light' ? 0.24 : 0.28})`
  }
}

export default customShadows
```

---

## `ccasaFrontend/src/@core/theme/overrides/index.ts`

```typescript
// Override Imports
import Accordion from './accordion'
import Alerts from './alerts'
import Autocomplete from './autocomplete'
import avatar from './avatar'
import backdrop from './backdrop'
import badges from './badges'
import breadcrumbs from './breadcrumbs'
import button from './button'
import buttonGroup from './button-group'
import card from './card'
import Checkbox from './checkbox'
import chip from './chip'
import dialog from './dialog'
import drawer from './drawer'
import fab from './fab'
import formControlLabel from './form-control-label'
import iconButton from './icon-button'
import input from './input'
import list from './list'
import menu from './menu'
import pagination from './pagination'
import paper from './paper'
import popover from './popover'
import progress from './progress'
import Radio from './radio'
import Rating from './rating'
import Select from './select'
import slider from './slider'
import snackbar from './snackbar'
import switchOverrides from './switch'
import tablePagination from './table-pagination'
import tabs from './tabs'
import timeline from './timeline'
import toggleButton from './toggle-button'
import tooltip from './tooltip'
import typography from './typography'

const overrides = () => {
  const skin = 'default'

  return Object.assign(
    {},
    Accordion(skin),
    Alerts,
    Autocomplete(skin),
    avatar,
    backdrop,
    badges,
    breadcrumbs,
    button,
    buttonGroup,
    card(skin),
    Checkbox,
    chip,
    dialog(skin),
    drawer(skin),
    fab,
    formControlLabel,
    iconButton,
    input,
    list,
    menu(skin),
    pagination,
    paper,
    popover(skin),
    progress,
    Radio,
    Rating,
    Select,
    slider,
    snackbar(skin),
    switchOverrides,
    tablePagination,
    tabs,
    timeline,
    toggleButton,
    tooltip,
    typography
  )
}

export default overrides
```

---

## `ccasaFrontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  plugins: [require('tailwindcss-logical'), require('./src/@core/tailwind/plugin')],
  theme: {
    extend: {}
  }
}

export default config
```

Los colores y utilidades extendidas de Tailwind se definen en el plugin siguiente (no en `theme.extend` del config raíz).

---

## `ccasaFrontend/src/@core/tailwind/plugin.ts` (colores y tokens para Tailwind)

```typescript
import plugin from 'tailwindcss/plugin'

module.exports = plugin(function () {}, {
  theme: {
    borderColor: ({ theme }) => ({
      ...theme('colors'),
      DEFAULT: 'var(--border-color, currentColor)'
    }),
    borderRadius: {
      none: '0px',
      xs: 'var(--mui-shape-customBorderRadius-xs)',
      sm: 'var(--mui-shape-customBorderRadius-sm)',
      DEFAULT: '0.375rem',
      md: 'var(--mui-shape-customBorderRadius-md)',
      lg: 'var(--mui-shape-customBorderRadius-lg)',
      xl: 'var(--mui-shape-customBorderRadius-xl)',
      '2xl': '0.75rem',
      '3xl': '1rem',
      '4xl': '1.5rem',
      full: '9999px'
    },
    screens: {
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
      '2xl': '1920px'
    },
    extend: {
      boxShadow: {
        xs: 'var(--mui-customShadows-xs)',
        sm: 'var(--mui-customShadows-sm)',
        DEFAULT: 'var(--mui-customShadows-md)',
        md: 'var(--mui-customShadows-md)',
        lg: 'var(--mui-customShadows-lg)',
        xl: 'var(--mui-customShadows-xl)'
      },
      colors: {
        primary: 'var(--primary-color)',
        primaryLight: 'var(--mui-palette-primary-lightOpacity)',
        primaryLighter: 'var(--mui-palette-primary-lighterOpacity)',
        secondary: 'var(--mui-palette-secondary-main)',
        error: 'var(--mui-palette-error-main)',
        errorLight: 'var(--mui-palette-error-lightOpacity)',
        errorLighter: 'var(--mui-palette-error-lighterOpacity)',
        warning: 'var(--mui-palette-warning-main)',
        info: 'var(--mui-palette-info-main)',
        success: 'var(--mui-palette-success-main)',
        textPrimary: 'var(--mui-palette-text-primary)',
        textSecondary: 'var(--mui-palette-text-secondary)',
        textDisabled: 'var(--mui-palette-text-disabled)',
        actionActive: 'var(--mui-palette-action-active)',
        actionHover: 'var(--mui-palette-action-hover)',
        actionSelected: 'var(--mui-palette-action-selected)',
        actionFocus: 'var(--mui-palette-action-focus)',
        backgroundPaper: 'var(--mui-palette-background-paper)',
        backgroundDefault: 'var(--mui-palette-background-default)',
        track: 'var(--mui-palette-customColors-trackBg)',
        backdrop: 'var(--backdrop-color)',
        facebook: '#497ce2',
        twitter: '#1da1f2',
        github: '#272727',
        googlePlus: '#db4437'
      },
      zIndex: {
        header: 'var(--header-z-index)',
        footer: 'var(--footer-z-index)',
        customizer: 'var(--customizer-z-index)',
        search: 'var(--search-z-index)',
        drawer: 'var(--drawer-z-index)'
      }
    }
  }
})
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

## `ccasaFrontend/src/components/layout/shared/Logo.tsx`

```tsx
'use client'

// React Imports
import type { CSSProperties } from 'react'

// Third-party Imports
import styled from '@emotion/styled'

// Component Imports
import MaterioLogo from '@core/svg/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

type LogoTextProps = {
  color?: CSSProperties['color']
}

const LogoText = styled.span<LogoTextProps>`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: uppercase;
  margin-inline-start: 10px;
`

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
  return (
    <div className='flex items-center min-bs-[24px]'>
      <MaterioLogo className='text-[22px] text-primary' />
      <LogoText color={color}>{themeConfig.templateName}</LogoText>
    </div>
  )
}

export default Logo
```

---

## `ccasaFrontend/src/views/Login.tsx`

```tsx
'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const Login = ({ mode, redirectTo = '/' }: { mode: Mode; redirectTo?: string }) => {
  const [email, setEmail] = useState('admin@ccasa.local')
  const [password, setPassword] = useState('change-me')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const { login, token, hydrated } = useAuth()

  useEffect(() => {
    if (!hydrated) return

    if (token) {
      router.replace(redirectTo)
    }
  }, [hydrated, token, router, redirectTo])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      router.replace(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/login' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`ccasa — ${themeConfig.templateName}`}</Typography>
              <Typography className='mbs-1' color='text.secondary'>
                Inicia sesión con el usuario del DataLoader del backend (por defecto admin@ccasa.local / change-me).
              </Typography>
            </div>
            {error ? (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            ) : null}
            <form noValidate autoComplete='on' onSubmit={e => void handleSubmit(e)} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Correo'
                name='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label='Contraseña'
                name='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={submitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsPasswordShown(s => !s)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button fullWidth variant='contained' type='submit' disabled={submitting}>
                {submitting ? 'Entrando…' : 'Entrar'}
              </Button>
              <Typography variant='body2' color='text.secondary' className='text-center'>
                ¿Sin sesión? El panel requiere backend en marcha y JWT (carpeta{' '}
                <code className='text-xs'>jwtKeys/*.pem</code> generada localmente; ver README del backend).
              </Typography>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Login
```

---

## `ccasaFrontend/src/app/(dashboard)/page.tsx`

```tsx
// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import LogbooksPanel from '@components/ccasa/LogbooksPanel'

// Config Imports
import { DOC_UI_ROUTES } from '@configs/ccasaDocumentation'

const docsEnApp = [
  {
    titulo: 'Excel — especificaciones',
    descripcion:
      'Hojas, columnas y mapeo a entidades para import/export y DTOs (docs/EXCEL_ESPECIFICACIONES.md).',
    href: DOC_UI_ROUTES.excelEspecificaciones,
    icon: 'ri-file-excel-2-line'
  },
  {
    titulo: 'Análisis → software',
    descripcion: 'Trazabilidad MER/Excel y roadmap por módulos (docs/ANALISIS_RESULTADOS_A_SOFTWARE.md).',
    href: DOC_UI_ROUTES.analisisResultados,
    icon: 'ri-git-repository-line'
  }
]

const DashboardCcasa = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mbe-2'>
          ccasa — Panel
        </Typography>
        <Typography color='text.secondary' className='mbe-6'>
          Datos en vivo desde el backend (<code className='text-sm'>NEXT_PUBLIC_API_BASE_URL</code>, por defecto{' '}
          <code className='text-sm'>http://localhost:8080</code>). Usuario de prueba tras arrancar el backend:{' '}
          <code className='text-sm'>admin@ccasa.local</code> / <code className='text-sm'>change-me</code>. En el menú lateral,
          catálogos, empleados, alertas, folios y cada tipo de entrada cargan listados reales vía{' '}
          <code className='text-sm'>GET</code> (CrudResponseDTO).
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <LogbooksPanel title='Bitácoras (UI-01)' />
      </Grid>

      <Grid item xs={12}>
        <Typography variant='h6' className='mbe-4'>
          Documentación en la app
        </Typography>
        <Grid container spacing={4}>
          {docsEnApp.map(item => (
            <Grid item xs={12} md={6} key={item.href}>
              <Card variant='outlined' className='bs-full'>
                <CardContent className='flex flex-col gap-3'>
                  <div className='flex items-center gap-2'>
                    <i className={`${item.icon} text-2xl text-primary`} />
                    <Typography variant='h6'>{item.titulo}</Typography>
                  </div>
                  <Typography variant='body2' color='text.secondary'>
                    {item.descripcion}
                  </Typography>
                  <Button component={Link} href={item.href} variant='outlined' size='small'>
                    Abrir resumen
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default DashboardCcasa
```

---

## Mantenimiento de este documento

Al cambiar archivos fuente, conviene volver a copiar su contenido aquí o regenerar la referencia desde el repo para que siga siendo fiel al código.
