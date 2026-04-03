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
  font-weight: 700;
  letter-spacing: 0.25px;
  text-transform: none;
  margin-inline-start: 10px;
`

type LogoProps = {
  color?: CSSProperties['color']
  variant?: 'light' | 'dark'
}

const Logo = ({ color, variant = 'dark' }: LogoProps) => {
  const isLight = variant === 'light'

  return (
    <div className='flex items-center min-bs-[24px]'>
      <MaterioLogo className={`text-[22px] ${isLight ? 'text-white' : 'text-primary'}`} />
      <LogoText color={color ?? (isLight ? '#FFFFFF' : undefined)}>{themeConfig.templateName}</LogoText>
    </div>
  )
}

export default Logo
