'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { useAuth } from '@/contexts/AuthContext'

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { role, hydrated } = useAuth()
  const router = useRouter()
  const isAdmin = role === 'Admin'

  useEffect(() => {
    if (hydrated && !isAdmin) {
      router.replace('/')
    }
  }, [hydrated, isAdmin, router])

  if (!hydrated) {
    return (
      <Box className='flex justify-center p-6'>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (!isAdmin) {
    return (
      <Box className='flex flex-col items-center justify-center min-h-[40vh] gap-2'>
        <Typography variant='h6'>Acceso restringido</Typography>
        <Typography variant='body2' color='text.secondary'>
          Esta sección es solo para administradores.
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}

export default AdminGuard
