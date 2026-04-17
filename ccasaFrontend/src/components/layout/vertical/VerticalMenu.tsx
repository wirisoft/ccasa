'use client'

// React Imports
import type { UIEvent } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Config Imports
import { ENTRADA_MODULOS } from '@configs/ccasaModules'

import { useAuth } from '@/contexts/AuthContext'
import { useConnectivity } from '@/hooks/useConnectivity'

const OFFLINE_READY_SLUGS = new Set(['conductividad'])

/** Etiquetas cortas solo en el menú lateral (las páginas siguen usando `mod.label` completo). */
const ENTRADA_NAV_LABEL: Partial<Record<string, string>> = {
  conductividad: 'Conductividad KCl',
  'temperatura-horno': 'Temperatura horno',
  'gastos-cartas': 'Gastos y cartas',
  'preparacion-soluciones': 'Prep. soluciones',
  'tratamiento-matraz': 'Trat. matraz'
}

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({
  scrollMenu
}: {
  scrollMenu: (container: UIEvent<HTMLElement> | HTMLElement, isPerfectScrollbar: boolean) => void
}) => {
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const { role } = useAuth()
  const { isOnline } = useConnectivity()
  const isAdmin = role === 'Admin'

  /** Admin, Supervisor y Analyst ven catálogos; Sampler no (tabla de permisos menú). */
  const showCatalogs = role !== 'Sampler'

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuSection label='Principal'>
          <MenuItem href='/' icon={<i className='ri-home-smile-line' />} title='Inicio'>
            Inicio
          </MenuItem>
          <MenuItem href={isOnline ? '/bitacoras' : undefined} icon={<i className='ri-book-2-line' />} title={isOnline ? 'Bitácoras' : 'Bitácoras (requiere conexión)'} disabled={!isOnline}>
            Bitácoras
          </MenuItem>
          <MenuItem href={isOnline ? '/folios' : undefined} icon={<i className='ri-numbers-line' />} title={isOnline ? 'Folios y bloques' : 'Folios y bloques (requiere conexión)'} disabled={!isOnline}>
            Folios y bloques
          </MenuItem>
        </MenuSection>

        <MenuSection label='Registros por tipo'>
          <SubMenu label='Entradas' title='Entradas' icon={<i className='ri-file-list-3-line' />}>
            <MenuItem href={isOnline ? '/entradas/core' : undefined} icon={<i className='ri-table-line' />} title={isOnline ? 'Núcleo' : 'Núcleo (requiere conexión)'} disabled={!isOnline}>
              Núcleo
            </MenuItem>
            {ENTRADA_MODULOS.map(mod => {
              const navLabel = ENTRADA_NAV_LABEL[mod.slug] ?? mod.label
              const offlineDisabled = !isOnline && !OFFLINE_READY_SLUGS.has(mod.slug)

              return (
                <MenuItem
                  key={mod.slug}
                  href={offlineDisabled ? undefined : `/entradas/${mod.slug}`}
                  icon={<i className={mod.iconClass} />}
                  title={offlineDisabled ? `${navLabel} (requiere conexión)` : navLabel}
                  disabled={offlineDisabled}
                >
                  {navLabel}
                </MenuItem>
              )
            })}
          </SubMenu>
        </MenuSection>

        {showCatalogs ? (
          <MenuSection label='Datos maestros'>
            <SubMenu label='Catálogos' title='Catálogos' icon={<i className='ri-database-2-line' />}>
              <MenuItem href={isOnline ? '/catalogos/reactivos' : undefined} icon={<i className='ri-flask-line' />} disabled={!isOnline}>
                Reactivos
              </MenuItem>
              <MenuItem href={isOnline ? '/catalogos/frascos-reactivo' : undefined} icon={<i className='ri-inbox-line' />} disabled={!isOnline}>
                Frascos
              </MenuItem>
              <MenuItem href={isOnline ? '/catalogos/lotes' : undefined} icon={<i className='ri-stack-line' />} disabled={!isOnline}>
                Lotes
              </MenuItem>
              <MenuItem href={isOnline ? '/catalogos/soluciones' : undefined} icon={<i className='ri-test-tube-line' />} disabled={!isOnline}>
                Soluciones
              </MenuItem>
              <MenuItem href={isOnline ? '/catalogos/insumos' : undefined} icon={<i className='ri-shopping-basket-line' />} disabled={!isOnline}>
                Insumos
              </MenuItem>
              <MenuItem href={isOnline ? '/catalogos/equipos' : undefined} icon={<i className='ri-tools-line' />} disabled={!isOnline}>
                Equipos
              </MenuItem>
            </SubMenu>
          </MenuSection>
        ) : null}

        <MenuSection label='Operación'>
          <MenuItem href={isOnline ? '/alertas' : undefined} icon={<i className='ri-alarm-warning-line' />} title={isOnline ? 'Alertas' : 'Alertas (requiere conexión)'} disabled={!isOnline}>
            Alertas
          </MenuItem>
          <MenuItem href={isOnline ? '/firmas' : undefined} icon={<i className='ri-ball-pen-line' />} title={isOnline ? 'Firmas' : 'Firmas (requiere conexión)'} disabled={!isOnline}>
            Firmas
          </MenuItem>
        </MenuSection>

        <MenuSection label='Administración'>
          {isAdmin ? (
            <>
              <MenuItem href={isOnline ? '/empleados' : undefined} icon={<i className='ri-team-line' />} title={isOnline ? 'Empleados' : 'Empleados (requiere conexión)'} disabled={!isOnline}>
                Empleados
              </MenuItem>
              <MenuItem href={isOnline ? '/roles' : undefined} icon={<i className='ri-shield-user-line' />} title={isOnline ? 'Roles' : 'Roles (requiere conexión)'} disabled={!isOnline}>
                Roles
              </MenuItem>
              <MenuItem href={isOnline ? '/configuracion' : undefined} icon={<i className='ri-settings-3-line' />} title={isOnline ? 'Configuración' : 'Configuración (requiere conexión)'} disabled={!isOnline}>
                Configuración
              </MenuItem>
            </>
          ) : null}
          <MenuItem href={isOnline ? '/account-settings' : undefined} icon={<i className='ri-user-settings-line' />} title={isOnline ? 'Mi cuenta' : 'Mi cuenta (requiere conexión)'} disabled={!isOnline}>
            Mi cuenta
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
