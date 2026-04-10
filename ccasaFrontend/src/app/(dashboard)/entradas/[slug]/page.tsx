import { notFound } from 'next/navigation'

import type { Metadata } from 'next'

// Component Imports
import EntradaTipoClient from './EntradaTipoClient'

// Config Imports
import { getEntradaModulo } from '@configs/ccasaModules'

const ENTRADA_METADATA_TITLE: Record<string, string> = {
  conductividad: 'Conductividad KCl (RF-05) — BSA Lab',
  'agua-destilada': 'Agua destilada — BSA Lab'
}

type PageProps = {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: PageProps): Metadata {
  const title = ENTRADA_METADATA_TITLE[params.slug] ?? 'Entrada — BSA Lab'

  return { title }
}

const EntradaTipoPage = ({ params }: PageProps) => {
  if (!getEntradaModulo(params.slug)) {
    notFound()
  }

  return <EntradaTipoClient slug={params.slug} />
}

export default EntradaTipoPage
