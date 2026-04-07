'use client'

// React Imports
import { useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

function initialsFromEmail(email: string | null | undefined): string {
  if (!email || !email.trim()) {
    return '?'
  }

  const local = email.split('@')[0]?.trim() || ''
  if (!local) {
    return '?'
  }

  const segments = local.split(/[._\-+]/).filter(s => s.length > 0)
  if (segments.length >= 2) {
    return (segments[0].charAt(0) + segments[1].charAt(0)).toUpperCase()
  }

  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase()
  }

  return local.charAt(0).toUpperCase()
}

const avatarLetterSx = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  fontWeight: 600
} as const

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { email, role, logout } = useAuth()

  const initials = useMemo(() => initialsFromEmail(email), [email])

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <div ref={anchorRef} className='mis-2 inline-flex'>
        <Badge
          overlap='circular'
          badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar
            alt={email || 'Usuario'}
            onClick={handleDropdownOpen}
            sx={{
              ...avatarLetterSx,
              width: 38,
              height: 38,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            {initials}
          </Avatar>
        </Badge>
      </div>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar
                      alt={email || 'Usuario'}
                      sx={{
                        ...avatarLetterSx,
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem'
                      }}
                    >
                      {initials}
                    </Avatar>
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {email || 'Usuario'}
                      </Typography>
                      <Typography variant='caption'>{role || '—'}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-user-settings-line' />
                    <Typography color='text.primary'>Mi cuenta</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={() => {
                        logout()
                        setOpen(false)
                        router.push('/login')
                      }}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Cerrar sesión
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
