import { notFound } from 'next/navigation'

// Component Imports
import EntradaTipoClient from './EntradaTipoClient'

// Config Imports
import { ENTRADA_SLUGS, getEntradaModulo } from '@configs/ccasaModules'

type PageProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return ENTRADA_SLUGS.map(slug => ({ slug }))
}

const EntradaTipoPage = ({ params }: PageProps) => {
  if (!getEntradaModulo(params.slug)) {
    notFound()
  }

  return <EntradaTipoClient slug={params.slug} />
}

export default EntradaTipoPage
