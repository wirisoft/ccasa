import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import AdminGuard from '@/components/ccasa/AdminGuard'

export const metadata: Metadata = {
  title: 'Configuración — BSA Lab'
}

export default function ConfiguracionLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>
}
