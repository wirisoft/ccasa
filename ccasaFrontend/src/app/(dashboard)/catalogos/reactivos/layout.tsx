import type { ReactNode } from 'react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reactivos — BSA Lab'
}

export default function ReactivosLayout({ children }: { children: ReactNode }) {
  return children
}
