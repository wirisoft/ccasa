# Referencia: Navbar, themeConfig y LogbooksPanel

Documento generado con el contenido de los archivos indicados (snapshot del repositorio).

---

## `ccasaFrontend/src/components/layout/vertical/NavbarContent.tsx`

Componente que renderiza el header/topbar: búsqueda (`NavSearch`), badge de estrellas GitHub, `ModeDropdown` (tema), campana de notificaciones y `UserDropdown`.

```tsx
// Next Imports
import Link from 'next/link'

// MUI Imports
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Config Imports
import { NEXT_PUBLIC_REPO_NAME } from '@configs/publicEnv'

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center'>
        <Link
          className='flex mie-2'
          href={`https://github.com/themeselection/${NEXT_PUBLIC_REPO_NAME}`}
          target='_blank'
        >
          <img
            height={24}
            alt='GitHub Repo stars'
            src={`https://img.shields.io/github/stars/themeselection/${NEXT_PUBLIC_REPO_NAME}`}
          />
        </Link>
        <ModeDropdown />
        <IconButton className='text-textPrimary'>
          <i className='ri-notification-2-line' />
        </IconButton>
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
```

---

## `ccasaFrontend/src/configs/themeConfig.ts`

```ts
/*
 * If you change the following items in the config object, you will not see any effect in the local development server
 * as these are stored in the cookie (cookie has the highest priority over the themeConfig):
 * 1. mode
 *
 * To see the effect of the above items, you can click on the reset button from the Customizer
 * which is on the top-right corner of the customizer besides the close button.
 * This will reset the cookie to the values provided in the config object below.
 *
 * Another way is to clear the cookie from the browser's Application/Storage tab and then reload the page.
 */

// Type Imports
import type { Mode } from '@core/types'

export type Config = {
  templateName: string
  settingsCookieName: string
  mode: Mode
  layoutPadding: number
  compactContentWidth: number
  disableRipple: boolean
}

const themeConfig: Config = {
  templateName: 'CCASA Lab',
  settingsCookieName: 'materio-mui-next-free-demo',
  mode: 'light', // 'light', 'dark'
  layoutPadding: 24, // Common padding for header, content, footer layout components (in px)
  compactContentWidth: 1440, // in px
  disableRipple: false // true, false
}

export default themeConfig
```

---

## `ccasaFrontend/src/components/ccasa/LogbooksPanel.tsx`

### Primeras 30 líneas

```tsx
'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
```

### Fragmento del render: «Datos desde GET…»

Incluye el `Stack` con contador y botón «Nueva bitácora», el `Typography` con `GET /api/v1/logbooks` y la tabla hasta el cierre del bloque condicional.

```tsx
      {!loading && !error && rows ? (
        <>
          <Stack direction='row' justifyContent='space-between' alignItems='center' className='mbe-2' flexWrap='wrap' useFlexGap>
            <Typography variant='body2' color='text.secondary'>
              {rows.length} registro{rows.length === 1 ? '' : 's'}
            </Typography>
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={handleOpenCreate}
              disabled={!token}
            >
              Nueva bitácora
            </Button>
          </Stack>
          <Typography variant='body2' color='text.secondary' className='mbe-4'>
            Datos desde <code>GET /api/v1/logbooks</code>.
          </Typography>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align='right'>Máx. entradas</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align='right'>{row.maxEntries}</TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Ver entradas'>
                        <IconButton
                          component={Link}
                          href={`/bitacoras/${row.id}`}
                          color='primary'
                          size='small'
                          aria-label='Ver entradas'
                        >
                          <i className='ri-eye-line' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Editar'>
                        <IconButton
                          color='default'
                          size='small'
                          aria-label='Editar'
                          onClick={() => handleOpenEdit(row)}
                        >
                          <i className='ri-pencil-line' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Eliminar'>
                        <IconButton
                          color='error'
                          size='small'
                          aria-label='Eliminar'
                          onClick={() => handleOpenDelete(row)}
                        >
                          <i className='ri-delete-bin-line' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
```
