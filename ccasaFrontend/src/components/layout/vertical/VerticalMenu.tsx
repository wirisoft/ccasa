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

/** Etiquetas cortas solo en el menú lateral (las páginas siguen usando `mod.label` completo). */
const ENTRADA_NAV_LABEL: Partial<Record<string, string>> = {
  conductividad: 'Conductividad',
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
          <MenuItem href='/bitacoras' icon={<i className='ri-book-2-line' />} title='Bitácoras'>
            Bitácoras
          </MenuItem>
          <MenuItem href='/folios' icon={<i className='ri-numbers-line' />} title='Folios y bloques'>
            Folios y bloques
          </MenuItem>
        </MenuSection>

        <MenuSection label='Registros por tipo'>
          <SubMenu label='Entradas' title='Entradas' icon={<i className='ri-file-list-3-line' />}>
            <MenuItem href='/entradas/core' icon={<i className='ri-table-line' />} title='Núcleo'>
              Núcleo
            </MenuItem>
            {ENTRADA_MODULOS.map(mod => {
              const navLabel = ENTRADA_NAV_LABEL[mod.slug] ?? mod.label

              return (
                <MenuItem
                  key={mod.slug}
                  href={`/entradas/${mod.slug}`}
                  icon={<i className={mod.iconClass} />}
                  title={navLabel}
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
              <MenuItem href='/catalogos/reactivos' icon={<i className='ri-flask-line' />} title='Reactivos'>
                Reactivos
              </MenuItem>
              <MenuItem
                href='/catalogos/frascos-reactivo'
                icon={<i className='ri-inbox-line' />}
                title='Frascos'
              >
                Frascos
              </MenuItem>
              <MenuItem href='/catalogos/lotes' icon={<i className='ri-stack-line' />} title='Lotes'>
                Lotes
              </MenuItem>
              <MenuItem href='/catalogos/soluciones' icon={<i className='ri-test-tube-line' />} title='Soluciones'>
                Soluciones
              </MenuItem>
              <MenuItem href='/catalogos/insumos' icon={<i className='ri-shopping-basket-line' />} title='Insumos'>
                Insumos
              </MenuItem>
              <MenuItem href='/catalogos/equipos' icon={<i className='ri-tools-line' />} title='Equipos'>
                Equipos
              </MenuItem>
            </SubMenu>
          </MenuSection>
        ) : null}

        <MenuSection label='Operación'>
          <MenuItem href='/alertas' icon={<i className='ri-alarm-warning-line' />} title='Alertas'>
            Alertas
          </MenuItem>
          <MenuItem href='/firmas' icon={<i className='ri-ball-pen-line' />} title='Firmas'>
            Firmas
          </MenuItem>
        </MenuSection>

        <MenuSection label='Administración'>
          {isAdmin ? (
            <>
              <MenuItem href='/empleados' icon={<i className='ri-team-line' />} title='Empleados'>
                Empleados
              </MenuItem>
              <MenuItem href='/roles' icon={<i className='ri-shield-user-line' />} title='Roles'>
                Roles
              </MenuItem>
              <MenuItem href='/configuracion' icon={<i className='ri-settings-3-line' />} title='Configuración'>
                Configuración
              </MenuItem>
            </>
          ) : null}
          <MenuItem href='/account-settings' icon={<i className='ri-user-settings-line' />} title='Mi cuenta'>
            Mi cuenta
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
