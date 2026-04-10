'use client'

// React Imports
import { useRef, useState } from 'react'
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
import { ROLE_LABELS } from '@/lib/ccasa/crudDisplay'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { email, role, firstName, lastName, logout } = useAuth()

  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : (email ?? 'Usuario')

  const initials =
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() ||
    email?.[0]?.toUpperCase() ||
    'U'

  const avatarSx = {
    bgcolor: '#1565C0',
    width: 38,
    height: 38,
    fontSize: 15,
    fontWeight: 600
  } as const

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
          <Avatar alt={displayName} onClick={handleDropdownOpen} sx={{ ...avatarSx, cursor: 'pointer' }}>
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
                      alt={displayName}
                      sx={{ bgcolor: '#1565C0', width: 40, height: 40, fontSize: 15, fontWeight: 600 }}
                    >
                      {initials}
                    </Avatar>
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {displayName}
                      </Typography>
                      {email ? (
                        <Typography variant='caption' color='text.secondary'>
                          {email}
                        </Typography>
                      ) : null}
                      <Typography variant='caption'>
                        {role != null ? ROLE_LABELS[role] ?? role : '—'}
                      </Typography>
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
