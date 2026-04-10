import type { ReactNode } from 'react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Firmas — BSA Lab'
}

export default function FirmasLayout({ children }: { children: ReactNode }) {
  return children
}
