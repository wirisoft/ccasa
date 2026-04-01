import { notFound } from 'next/navigation'

// Component Imports
import ModulePlaceholder from '@components/ccasa/ModulePlaceholder'

// Config Imports
import { ENTRADA_SLUGS, getEntradaModulo } from '@configs/ccasaModules'

type PageProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return ENTRADA_SLUGS.map(slug => ({ slug }))
}

const EntradaTipoPage = ({ params }: PageProps) => {
  const mod = getEntradaModulo(params.slug)

  if (!mod) {
    notFound()
  }

  return (
    <ModulePlaceholder
      title={mod.label}
      description={`Pantalla de listado, alta y detalle para este tipo de bitácora. El CRUD genérico usa CrudRequestDTO/CrudResponseDTO en la base indicada; la UI de negocio deberá alinear campos con docs/EXCEL_ESPECIFICACIONES.md y con los DTOs específicos del servicio (p. ej. agua destilada vía POST /entries/distilled-water). Estados Entry: Draft / Signed / Locked.`}
      docRef={mod.docRef}
      apiResources={[
        {
          title: 'Controlador principal',
          crudPath: mod.backend.crudBasePath,
          controller: mod.backend.controllerCrud,
          extras: mod.backend.extraEndpoints
        }
      ]}
      documentationHints={{
        excelEspecificaciones: mod.excelEspecificacionesHint,
        analisisResultados: mod.analisisResultadosHint
      }}
      backHref='/'
      backLabel='Volver al inicio'
    />
  )
}

export default EntradaTipoPage
