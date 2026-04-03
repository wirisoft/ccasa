// Next Imports
import { IBM_Plex_Sans } from 'next/font/google'

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

const ibmPlex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

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
    typography: typography(ibmPlex.style.fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '38 50 56',
      dark: '207 216 220',
      lightShadow: '38 50 56',
      darkShadow: '19 23 27'
    }
  } as Theme
}

export default theme
