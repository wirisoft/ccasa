# Implementacion Modulo Conductividad

## Objetivo

Implementar el backend del modulo de conductividad para que:

- el usuario capture principalmente el `peso`
- el backend calcule automaticamente los valores intermedios y finales
- se genere un folio visible con formato `BSA-COND-000001`
- el revisor se asigne automaticamente por nomenclatura `TCM` o `TMC`
- el usuario pueda subir una firma de imagen
- el registro pueda filtrarse y exportarse a PDF individual o multiple

## Regla de calculo

La implementacion toma como base las constantes actuales del backend:

- `7.4565`
- `0.01`
- `0.1`
- `1412`

Flujo de calculo:

1. `uScmReferencia = (C25 * B24) / C24`
2. `molCalculado = (peso * F24) / uScmReferencia`
3. `conductividadFinal = (molCalculado * F28) / D28`

Redondeos aplicados:

- `uScmReferencia`: 4 decimales
- `molCalculado`: 6 decimales
- `conductividadFinal`: 0 decimales para la salida final del formato

## Endpoints nuevos

### Conductividad

- `POST /api/v1/conductivity-records`
- `GET /api/v1/conductivity-records`
- `GET /api/v1/conductivity-records/{id}`
- `POST /api/v1/conductivity-records/{id}/review`
- `GET /api/v1/conductivity-records/{id}/pdf`
- `POST /api/v1/conductivity-records/pdf-batch`

### Firma de usuario

- `POST /api/v1/users/{id}/signature-file`

## Payload de creacion

```json
{
  "type": "High",
  "weightGrams": 0.7458,
  "recordedAt": "2026-04-08T12:00:00Z",
  "preparationTime": "08:10:00",
  "observation": "AGUA LIBRE DE CO2",
  "logbookId": 1
}
```

## Payload de revision

```json
{
  "reviewerUserId": 15
}
```

`reviewerUserId` es opcional. Si no se envia, el backend intenta:

1. usar el usuario autenticado si cumple la regla de revisor
2. buscar un usuario activo con nomenclatura `TCM`
3. buscar un usuario activo con nomenclatura `TMC`

## Respuesta del registro

La respuesta incluye:

- ids del registro y de la entrada base
- folio visible
- tipo
- peso
- valores intermedios
- valor final
- resultado en rango
- fecha y hora de preparacion
- observaciones
- estado de la entrada
- datos del usuario que prepara
- datos del revisor

## Firma del usuario

Restricciones del endpoint de firma:

- solo permite imagenes
- tipos soportados: `png`, `jpg`, `jpeg`, `webp`, `gif`
- rechaza cualquier otro archivo
- guarda metadata en `app_user`
- guarda el archivo en `ccasaBackend/uploads/signatures`

## Modelo de datos agregado

### `app_user`

Campos agregados:

- `nomenclature`
- `signature_file_name`
- `signature_content_type`
- `signature_storage_path`
- `signature_uploaded_at`

### `entry_conductivity`

Campos agregados:

- `display_folio`
- `preparation_time`
- `observation`
- `reviewer_user_id`
- `reviewed_at`
- `reference_u_scm`
- `reference_mol`
- `reference_standard_u_scm`

## Filtros disponibles

`GET /api/v1/conductivity-records`

Parametros:

- `folio`
- `fromDate`
- `toDate`

## Estado actual de esta iteracion

Implementado:

- creacion del registro con calculo automatico
- creacion de entrada base y folio visible
- asignacion de revisor por nomenclatura
- revision del registro
- exportacion PDF individual
- exportacion multiple en ZIP
- carga de firma por usuario

Pendiente para siguiente iteracion:

- plantilla PDF identica al formato Excel
- filtros avanzados por estado, usuario y tipo
- endpoint de descarga directa de imagen de firma
- integracion de frontend especifica del modulo
- pruebas automatizadas dedicadas al nuevo flujo
