import type { ReactNode } from 'react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Empleados — BSA Lab'
}

export default function EmpleadosLayout({ children }: { children: ReactNode }) {
  return children
}
