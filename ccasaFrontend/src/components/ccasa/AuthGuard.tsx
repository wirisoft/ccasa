'use client'

// React Imports
import { useEffect } from 'react'
import type { ReactNode } from 'react'

// Next Imports
import { usePathname, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { token, hydrated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!hydrated) return

    if (!token) {
      const next = encodeURIComponent(pathname || '/')

      router.replace(`/login?next=${next}`)
    }
  }, [hydrated, token, router, pathname])

  if (!hydrated || !token) {
    return (
      <Box className='flex items-center justify-center min-bs-[40vh]'>
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}

export default AuthGuard
