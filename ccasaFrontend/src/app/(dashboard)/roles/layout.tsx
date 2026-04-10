import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import AdminGuard from '@/components/ccasa/AdminGuard'

export const metadata: Metadata = {
  title: 'Roles — BSA Lab'
}

export default function RolesLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>
}
