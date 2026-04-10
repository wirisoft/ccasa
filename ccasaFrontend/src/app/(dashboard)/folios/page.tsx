import type { Metadata } from 'next'

// Component Imports
import FoliosPageClient from './FoliosPageClient'

export const metadata: Metadata = {
  title: 'Folios y bloques — BSA Lab'
}

const FoliosPage = () => <FoliosPageClient />

export default FoliosPage
