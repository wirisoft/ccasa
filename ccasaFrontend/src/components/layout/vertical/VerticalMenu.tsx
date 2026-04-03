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

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()

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
          <MenuItem href='/' icon={<i className='ri-home-smile-line' />}>
            Inicio
          </MenuItem>
          <MenuItem href='/bitacoras' icon={<i className='ri-book-2-line' />}>
            Bitácoras
          </MenuItem>
          <MenuItem href='/folios' icon={<i className='ri-numbers-line' />}>
            Folios y bloques
          </MenuItem>
        </MenuSection>

        <MenuSection label='Registros por tipo'>
          <SubMenu label='Entradas' icon={<i className='ri-file-list-3-line' />}>
            <MenuItem href='/entradas/core' icon={<i className='ri-table-line' />}>
              Núcleo (tabla Entry)
            </MenuItem>
            {ENTRADA_MODULOS.map(mod => (
              <MenuItem key={mod.slug} href={`/entradas/${mod.slug}`} icon={<i className={mod.iconClass} />}>
                {mod.label}
              </MenuItem>
            ))}
          </SubMenu>
        </MenuSection>

        <MenuSection label='Datos maestros'>
          <SubMenu label='Catálogos' icon={<i className='ri-database-2-line' />}>
            <MenuItem href='/catalogos/reactivos' icon={<i className='ri-flask-line' />}>
              Reactivos
            </MenuItem>
            <MenuItem href='/catalogos/frascos-reactivo' icon={<i className='ri-inbox-line' />}>
              Frascos de reactivo
            </MenuItem>
            <MenuItem href='/catalogos/lotes' icon={<i className='ri-stack-line' />}>
              Lotes (batch)
            </MenuItem>
            <MenuItem href='/catalogos/soluciones' icon={<i className='ri-test-tube-line' />}>
              Soluciones
            </MenuItem>
            <MenuItem href='/catalogos/insumos' icon={<i className='ri-shopping-basket-line' />}>
              Insumos
            </MenuItem>
            <MenuItem href='/catalogos/equipos' icon={<i className='ri-tools-line' />}>
              Equipos
            </MenuItem>
          </SubMenu>
        </MenuSection>

        <MenuSection label='Operación'>
          <MenuItem href='/alertas' icon={<i className='ri-alarm-warning-line' />}>
            Alertas
          </MenuItem>
          <MenuItem href='/firmas' icon={<i className='ri-ball-pen-line' />}>
            Firmas y flujo
          </MenuItem>
        </MenuSection>

        <MenuSection label='Administración'>
          <MenuItem href='/empleados' icon={<i className='ri-team-line' />}>
            Empleados
          </MenuItem>
          <MenuItem href='/roles' icon={<i className='ri-shield-user-line' />}>
            Roles
          </MenuItem>
          <MenuItem href='/configuracion' icon={<i className='ri-settings-3-line' />}>
            Configuración del laboratorio
          </MenuItem>
          <MenuItem href='/account-settings' icon={<i className='ri-user-settings-line' />}>
            Mi cuenta
          </MenuItem>
        </MenuSection>

        <MenuSection label='Documentación (repo)'>
          <MenuItem href='/documentacion/excel-especificaciones' icon={<i className='ri-file-excel-2-line' />}>
            EXCEL_ESPECIFICACIONES
          </MenuItem>
          <MenuItem href='/documentacion/analisis-resultados-a-software' icon={<i className='ri-git-repository-line' />}>
            Análisis → software
          </MenuItem>
        </MenuSection>

        <MenuSection label='Plataforma'>
          <MenuItem href='/plataforma/tenants' icon={<i className='ri-building-4-line' />}>
            Laboratorios (Super Admin)
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
