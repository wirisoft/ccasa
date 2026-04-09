'use client'

// React Imports
import { useRef } from 'react'
import type { UIEvent } from 'react'

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
  background:
    'linear-gradient(#0D2137 5%, rgba(13, 33, 55, 0.85) 30%, rgba(13, 33, 55, 0.5) 65%, rgba(13, 33, 55, 0.3) 75%, transparent)',
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = () => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, toggleVerticalNav } = useVerticalNav()

  // Refs
  const shadowRef = useRef<HTMLDivElement | null>(null)

  const scrollMenu = (container: UIEvent<HTMLElement> | HTMLElement, isPerfectScrollbar: boolean) => {
    const scrollEl: HTMLElement | null = (() => {
      if (isBreakpointReached || !isPerfectScrollbar) {
        const t = (container as UIEvent<HTMLElement>).target

        return t instanceof HTMLElement ? t : null
      }

      return container as HTMLElement
    })()

    if (shadowRef.current && scrollEl && scrollEl.scrollTop > 0) {
      if (!shadowRef.current.classList.contains('scrolled')) {
        shadowRef.current.classList.add('scrolled')
      }
    } else if (shadowRef.current) {
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
          <Logo variant='light' />
        </Link>
        {isBreakpointReached && <i className='ri-close-line text-xl' onClick={() => toggleVerticalNav(false)} />}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <VerticalMenu scrollMenu={scrollMenu} />
    </VerticalNav>
  )
}

export default Navigation
