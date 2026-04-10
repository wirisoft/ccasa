import type { ReactNode } from 'react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alertas — BSA Lab'
}

export default function AlertasLayout({ children }: { children: ReactNode }) {
  return children
}
