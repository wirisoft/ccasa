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
 * Resumen operativo de docs/EXCEL_ESPECIFICACIONES.md para quien implemente UI e import/export.
 */
const ExcelEspecificacionesPage = () => {
  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader
          title='Especificaciones Excel → software'
          subheader={
            <Typography component='span' variant='body2' color='text.secondary'>
              Archivo en el repo: <code>{REPO_DOC_PATHS.excelEspecificaciones}</code>
            </Typography>
          }
        />
        <CardContent>
          <Typography className='mbe-4' color='text.secondary'>
            Este documento define hojas, columnas y el mapeo a entidades (ENTRY_*, catálogos) para importación,
            exportación y trazabilidad con el MER. Cada pantalla de tipo de entrada debe respetar el mismo contrato
            de columnas en DTOs y validaciones.
          </Typography>
          <Typography variant='subtitle2' className='mbe-2'>
            Contenido por plantilla (resumen)
          </Typography>
          <List dense disablePadding>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='1 — Agua destilada 1-MT'
                secondary='PORTADA, BITACORA, RECONOCIMIENTO DE FIRMAS, MACHOTE, hojas F; BD 1-MT-02/03: FOLIO, PH, CE, INICIALES, FIRMA (+ ENAYO/INF/SUP en 1-MT-03). → ENTRY_DISTILLED_WATER, BATCH.'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='2 — Conductividad alta'
                secondary='Hojas por fecha YYYYMMDD (14 columnas). → ENTRY_CONDUCTIVITY type High.'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='3 — Conductividad baja'
                secondary='Igual estructura por fecha; BD adicional con F DISOLVENTE, F BALANZA, F HORNO, MCF. → ENTRY_CONDUCTIVITY type Low.'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='4 y 5 — Gastos CE / pH'
                secondary='Cartas: ENAYO, INF, SUP, VALOR, ALEATORIO; hojas Hanna, Sigma, MCF. → ENTRY_EXPENSE_CHART.'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='6 — Carta control horno'
                secondary='MACHOTE; hojas por mes; equipo, clave, días. → ENTRY_OVEN_TEMP (RF-10, UI-02).'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='11 — Registro horno secado M-HS'
                secondary='FOLIO 1…200; reactivo, tiempos, analista, supervisor. → ENTRY_DRYING_OVEN.'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='12 — Lavado material M-LM'
                secondary='BD 28 columnas aprox. (GARRAFAS, FRASCOS, piezas, fechas). → ENTRY_MATERIAL_WASH.'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='14 — Preparación soluciones M-SOL'
                secondary='Hojas por fecha + BD con SOLUCION, CONCENTRACION, CANTIDAD, CLAVE y columnas de pesada. → ENTRY_SOLUTION_PREP, ENTRY_WEIGHING, SOLUTION.'
              />
            </ListItem>
            <ListItem alignItems='flex-start'>
              <ListItemText
                primary='Listados.xlsx'
                secondary='REACTIVOS, EQUIPOS, personal (ANALISTA, MUESTREADOR, SUPERVISORES). → catálogos REAGENT, SOLUTION, USER/roles; pantalla Equipos en la app.'
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExcelEspecificacionesPage
