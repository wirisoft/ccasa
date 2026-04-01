// MUI Imports
import Typography from '@mui/material/Typography'

// Component Imports
import EntriesByLogbookPanel from '@components/ccasa/EntriesByLogbookPanel'

type PageProps = {
  params: { logbookId: string }
}

const BitacoraEntradasPage = ({ params }: PageProps) => {
  const id = Number(params.logbookId)

  if (Number.isNaN(id) || id < 1) {
    return <Typography color='error'>Identificador de bitácora no válido.</Typography>
  }

  return <EntriesByLogbookPanel logbookId={id} />
}

export default BitacoraEntradasPage
