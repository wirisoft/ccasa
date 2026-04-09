# Contexto: cambios recientes — módulo de conductividad y firma de usuario

Documento de contexto para asistentes y desarrolladores. Resume **qué entró en el repositorio** en el último `git pull` relevante (fast-forward) y **cómo usar el nuevo backend**.

---

## 1. Origen del cambio (Git)

| Campo | Valor |
|--------|--------|
| **Operación** | `pull` — *fast-forward* |
| **Estado antes** | `HEAD` en `a5f2620` |
| **Estado después** | `HEAD` en `003402c` |
| **Commits traídos** | **1** |
| **Hash** | `003402cc439dde6443b115d017f99633a6b9b452` |
| **Mensaje** | `implementacion modulo de conductividad` |
| **Autor** | wirisoft |
| **Fecha** | 2026-04-08 14:54:33 -0600 |

**Alcance aproximado:** ~1311 líneas añadidas, ~4 eliminadas, **17 archivos** tocados (principalmente `ccasaBackend/`).

---

## 2. Objetivo funcional del commit

Implementar el **backend del módulo de conductividad** para que:

- El usuario capture principalmente el **peso** (`weightGrams`).
- El backend **calcule** valores intermedios y la conductividad final.
- Se genere un **folio visible** con formato `BSA-COND-000001`.
- El **revisor** se asigne automáticamente por nomenclatura **TCM** o **TMC** (con reglas de fallback).
- El usuario pueda **subir una imagen de firma**.
- Los registros se puedan **filtrar** y **exportar a PDF** (individual o lote en ZIP).

Además: endpoint para **subida de firma** bajo `/api/v1/users/{id}/signature-file`.

---

## 3. Archivos nuevos o modificados (lista orientativa)

| Área | Ruta (relativa a `ccasaBackend/`) |
|------|-----------------------------------|
| Documentación interna | `CONDUCTIVIDAD_IMPLEMENTACION.md` |
| API conductividad | `src/main/java/com/backend/ccasa/controllers/ConductivityRecordController.java` |
| API usuarios (firma) | `src/main/java/com/backend/ccasa/controllers/crud/UserCrudController.java` |
| Entidades | `.../persistence/entities/UserEntity.java`, `.../entities/entry/EntryConductivityEntity.java` |
| Repositorios | `.../repositories/EntryConductivityRepository.java`, `.../repositories/UserRepository.java` |
| Servicios | `.../service/IConductivityRecordService.java`, `.../service/impl/ConductivityRecordServiceImpl.java` |
| Firma | `.../service/IUserSignatureService.java`, `.../service/impl/UserSignatureServiceImpl.java` |
| CRUD | `.../service/impl/support/CrudEntityMapper.java` |
| DTOs | `ConductivityBatchPdfRequestDTO`, `ConductivityRecordResponseDTO`, `ConductivityReviewRequestDTO`, `CreateConductivityRecordRequestDTO`, `UserSignatureResponseDTO` |

---

## 4. Endpoints nuevos

### 4.1 Conductividad — base `/api/v1/conductivity-records`

| Método | Ruta | Rol(es) típicos |
|--------|------|------------------|
| `POST` | `/api/v1/conductivity-records` | `ADMIN`, `ANALYST`, `SUPERVISOR` |
| `GET` | `/api/v1/conductivity-records` | `ADMIN`, `ANALYST`, `SUPERVISOR` |
| `GET` | `/api/v1/conductivity-records/{id}` | `ADMIN`, `ANALYST`, `SUPERVISOR` |
| `POST` | `/api/v1/conductivity-records/{id}/review` | `ADMIN`, `ANALYST`, `SUPERVISOR` |
| `GET` | `/api/v1/conductivity-records/{id}/pdf` | `ADMIN`, `ANALYST`, `SUPERVISOR` |
| `POST` | `/api/v1/conductivity-records/pdf-batch` | `ADMIN`, `ANALYST`, `SUPERVISOR` |

**Listado (`GET` colección):** además de `folio`, `fromDate`, `toDate`, el controlador expone query params opcionales:

- `type` — `ConductivityTypeEnum`
- `status` — `EntryStatusEnum`
- `createdByUserId`
- `reviewerUserId`

Las fechas `fromDate` / `toDate` se convierten a `Instant` en UTC en el controlador (rango de día para `toDate` hasta fin de ese día).

### 4.2 Firma de usuario

| Método | Ruta | Autorización |
|--------|------|----------------|
| `POST` | `/api/v1/users/{id}/signature-file` | `ADMIN` **o** el propio usuario (`@ccasaUserSecurity.isSelf(#id)`) |

Cuerpo: `multipart/form-data` con parámetro `file`.

---

## 5. Reglas de cálculo (resumen)

Constantes de referencia en backend: `7.4565`, `0.01`, `0.1`, `1412`.

Flujo (nomenclatura tipo hoja de cálculo en la doc original):

1. `uScmReferencia = (C25 * B24) / C24`
2. `molCalculado = (peso * F24) / uScmReferencia`
3. `conductividadFinal = (molCalculado * F28) / D28`

**Redondeos:**

- `uScmReferencia`: 4 decimales  
- `molCalculado`: 6 decimales  
- `conductividadFinal`: 0 decimales en la salida final del formato  

---

## 6. Payloads de ejemplo

### 6.1 Creación de registro

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

### 6.2 Revisión

```json
{
  "reviewerUserId": 15
}
```

`reviewerUserId` es **opcional**. Si no se envía, el backend intenta (orden indicado en la doc del repo):

1. Usuario autenticado si cumple la regla de revisor.  
2. Usuario activo con nomenclatura **TCM**.  
3. Usuario activo con nomenclatura **TMC**.  

---

## 7. Respuesta del registro (campos esperados)

La respuesta incluye, entre otros: ids del registro y de la entrada base, folio visible, tipo, peso, valores intermedios, valor final, si el resultado está en rango, fecha/hora de preparación, observaciones, estado de la entrada, datos del usuario que prepara y del revisor.

---

## 8. Firma de usuario — restricciones

- Solo **imágenes**.  
- Tipos admitidos: `png`, `jpg`, `jpeg`, `webp`, `gif`.  
- Metadata en tabla `app_user`; archivo en `ccasaBackend/uploads/signatures` (según documentación del proyecto).

---

## 9. Modelo de datos ampliado (resumen)

### `app_user`

Campos agregados (conceptualmente): `nomenclature`, `signature_file_name`, `signature_content_type`, `signature_storage_path`, `signature_uploaded_at`.

### `entry_conductivity`

Campos agregados (conceptualmente): `display_folio`, `preparation_time`, `observation`, `reviewer_user_id`, `reviewed_at`, `reference_u_scm`, `reference_mol`, `reference_standard_u_scm`.

*(Detalle exacto de columnas y anotaciones JPA: ver entidades en el código.)*

---

## 10. Estado según la iteración del commit

**Implementado en esa entrega:**

- Creación del registro con cálculo automático.  
- Entrada base y folio visible.  
- Asignación de revisor por nomenclatura.  
- Revisión del registro.  
- PDF individual y ZIP para lote.  
- Carga de firma por usuario.  

**Pendiente (listado de la doc del repo):**

- Plantilla PDF idéntica al formato Excel.  
- Filtros avanzados adicionales (la API ya expone varios filtros en `GET` — alinear expectativas con el documento `CONDUCTIVIDAD_IMPLEMENTACION.md` si difieren).  
- Endpoint de descarga directa de imagen de firma.  
- Integración frontend específica del módulo.  
- Pruebas automatizadas dedicadas al flujo.  

---

## 11. Documentación relacionada en el repo

- Especificación detallada del módulo: [`ccasaBackend/CONDUCTIVIDAD_IMPLEMENTACION.md`](../ccasaBackend/CONDUCTIVIDAD_IMPLEMENTACION.md)  
- Reglas de arquitectura backend del workspace: `.cursor/rules/ccasa-backend-architecture.mdc` (convenciones de paquetes `services` vs código existente en `service`, DTOs, `/api/v1`, etc.)

---

## 12. Nota para quien mantenga este documento

Actualizar la **sección 1** (hash, fechas, rango de commits) cuando haya un nuevo `pull` relevante. El resto del documento describe el **contenido funcional** introducido por el commit `003402c` y puede seguir siendo válido hasta que el código diverja; en ese caso, priorizar el código fuente y `CONDUCTIVIDAD_IMPLEMENTACION.md`.
