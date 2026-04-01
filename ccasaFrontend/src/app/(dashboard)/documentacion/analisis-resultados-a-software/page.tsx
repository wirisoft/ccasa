// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

// Config Imports
import { REPO_DOC_PATHS } from '@configs/ccasaDocumentation'

/**
 * Resumen operativo de docs/ANALISIS_RESULTADOS_A_SOFTWARE.md — trazabilidad y roadmap por módulos.
 */
const AnalisisResultadosPage = () => {
  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader
          title='De resultados del análisis a software funcional'
          subheader={
            <Typography component='span' variant='body2' color='text.secondary'>
              Archivo en el repo: <code>{REPO_DOC_PATHS.analisisResultadosASoftware}</code>
            </Typography>
          }
        />
        <CardContent className='flex flex-col gap-4'>
          <Typography color='text.secondary'>
            Explica por qué el diseño sigue al MER, a los 28 Excel y a EXCEL_ESPECIFICACIONES.md, y cómo completar
            el sistema repitiendo el patrón de “agua destilada” por tipo de entrada más transversales (folios,
            firmas, alertas, catálogos, auth).
          </Typography>
          <Typography variant='subtitle2'>Origen de cada pieza (§1.1)</Typography>
          <List dense disablePadding>
            <ListItem>
              <ListItemText primary='MER' secondary='Entidades, RF/RNF/UI, estados Draft/Signed/Locked.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='28 Excel' secondary='Estructura real → tipos ENTRY_* y DTOs.' />
            </ListItem>
            <ListItem>
              <ListItemText
                primary='EXCEL_ESPECIFICACIONES.md'
                secondary='Mapeo columna → campo; reglas de import/export por bitácora.'
              />
            </ListItem>
            <ListItem>
              <ListItemText primary='Manual / flujo' secondary='Ciclo de folios (RF-03), doble firma (RF-02), alertas (UI-02).' />
            </ListItem>
          </List>
          <Typography variant='subtitle2'>Roadmap por tipo de entrada (§2.2)</Typography>
          <Typography variant='body2' color='text.secondary' className='mbe-2'>
            Cada fila es un módulo funcional: servicio + DTOs + endpoints CRUD (+ Excel opcional).
          </Typography>
          <List dense disablePadding>
            <ListItem>
              <ListItemText primary='1 · Conductividad' secondary='EntryConductivity · Excel 2 y 3.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='2 · Temperatura horno' secondary='EntryOvenTemp · carta control + alerta Critical Oven.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='3 · Horno secado' secondary='EntryDryingOven · M-HS.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='4 · Gastos' secondary='EntryExpenseChart · cartas CE/pH.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='5 · Lavado material' secondary='EntryMaterialWash · M-LM.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='6 · Preparación soluciones' secondary='EntrySolutionPrep + EntryWeighing · M-SOL.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='7 · Precisión / matraz' secondary='EntryAccuracy, EntryFlaskTreatment cuando se priorice.' />
            </ListItem>
          </List>
          <Typography variant='subtitle2'>Transversales (§2.3)</Typography>
          <List dense disablePadding>
            <ListItem>
              <ListItemText primary='Firmas RF-02' secondary='Signature; flujo Signed/Locked en servicios/API.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='Folios RF-03' secondary='FolioBlock + Folio; asignación al crear entrada.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='Alertas' secondary='Alert + reglas (ej. horno fuera de rango).' />
            </ListItem>
            <ListItem>
              <ListItemText primary='Catálogos' secondary='Reagent, Solution, Batch, Supply para desplegables y validación.' />
            </ListItem>
            <ListItem>
              <ListItemText primary='Usuarios y roles RF-01' secondary='JWT y autorización por rol en endpoints.' />
            </ListItem>
          </List>
          <Typography variant='subtitle2'>Patrón repetible (§3.1)</Typography>
          <Typography variant='body2' color='text.secondary'>
            Entidad → Repository → I*Service / *ServiceImpl → DTOs → Controller bajo /api/v1/ → (opcional) import/export
            con EXCEL_ESPECIFICACIONES.md como contrato. Fuentes de verdad listadas en §3.2 del documento.
          </Typography>
          <Typography variant='body2' color='text.disabled'>
            Listado hoja por hoja de los 28 Excel: <code>{REPO_DOC_PATHS.excelAnalysisSummary}</code> en la raíz del
            proyecto.
          </Typography>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalisisResultadosPage
