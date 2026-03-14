# De los resultados del análisis a software funcional y escalable

Este documento explica **a qué se debe** el diseño actual (trazabilidad con los documentos y Excel) y **cómo** convertir toda esa información en un sistema funcional y escalable.

---

## 1. A qué se debe el diseño: trazabilidad documento → software

### 1.1 Origen de cada pieza

| Fuente | Qué aporta | Cómo se refleja en el software |
|--------|------------|-------------------------------|
| **MER (HTML)** | Entidades, relaciones, RF/RNF/UI | Capas **core**, **catálogos**, **entradas** y **soporte**. Entidades JPA con auditoría y soft delete. Estados Draft/Signed/Locked (RNF-01). |
| **28 archivos Excel** | Estructura real de datos: hojas, columnas, ejemplos | Tipos de entrada (ENTRY_*) y DTOs. Hoja "BD" o equivalente = tabla de datos; columnas = campos de entidad. |
| **EXCEL_ESPECIFICACIONES.md** | Mapeo hoja/columna → entidad/campo | Reglas de importación/exportación y validación por tipo de bitácora. |
| **Flujo / Manual (PDF/DOCX)** | Procedimientos y flujo de trabajo | Ciclo de folios (RF-03), doble firma (RF-02), alertas (ej. horno crítico UI-02). |

El backend ya implementa: **15 bitácoras**, **Entry + EntryDistilledWater**, **Folio/FolioBlock**, **User/Role**, **catálogos** (Reagent, Batch, Solution, etc.) y **API bajo `/api/v1/`**. Eso sale directamente del MER y del análisis Excel (hoja BD de agua destilada → ENTRY_DISTILLED_WATER con PH, CE, promedios).

### 1.2 Por qué es “funcional” y “escalable”

- **Funcional**: Cada tipo de bitácora (agua destilada, conductividad, horno, gastos, etc.) tiene su **origen en un Excel concreto** y en el MER. Implementar un tipo = entidad hija de Entry + servicio + DTO + (opcional) import/export Excel.
- **Escalable**: Misma arquitectura por tipo de entrada (Entity, Repository, I*Service, *ServiceImpl, Controller, DTOs). Añadir un nuevo tipo no cambia el core; solo añade un módulo acotado.

---

## 2. Cómo convertirlo en software funcional (roadmap por módulos)

### 2.1 Ya construido (base funcional)

- **Core**: Logbook, Folio, FolioBlock, Entry (estados), User, Role.
- **Un tipo de entrada completo**: Agua destilada (crear, consultar, promedios, is_acceptable).
- **API**: `/api/v1/logbooks`, `/api/v1/logbooks/{id}`, `/api/v1/entries/by-logbook/{logbookId}`, `/api/v1/entries/{id}/distilled-water`, `POST /api/v1/entries/distilled-water`.
- **Excepciones y convenciones**: Regla de arquitectura en `.cursor/rules/ccasa-backend-architecture.mdc`, excepciones de negocio y manejador global.

### 2.2 Siguientes pasos para “completar” funcionalidad (por documento/Excel)

Cada fila es un **módulo funcional** que se puede desarrollar siguiendo el mismo patrón que agua destilada:

| # | Tipo de entrada / Módulo | Documento/Excel de referencia | Entidad JPA | Qué implementar para que sea “funcional” |
|---|---------------------------|-------------------------------|-------------|------------------------------------------|
| 1 | **Conductividad (alta/baja)** | 2-CONDUCTIVIDAD ALTA, 3-CONDUCTIVIDAD BAJA; hojas YYYYMMDD, 14 cols | EntryConductivity | Servicio + DTOs + endpoints CRUD + (opcional) import Excel por hoja/fecha. |
| 2 | **Temperatura horno (carta control)** | 6-CARTA CONTROL HORNO; hojas por mes | EntryOvenTemp | Servicio + DTOs + endpoints + alerta “Critical Oven” (UI-02). |
| 3 | **Horno de secado (uso)** | 11-REGISTRO HORNO SECADO M-HS; FOLIO 1…200 | EntryDryingOven | Servicio + DTOs (entry_time, exit_time, analyst, supervisor, meets_temp) + endpoints. |
| 4 | **Gastos (cartas)** | 4 Y 5-GASTOS (CE, PH); ENAYO, INF, SUP, VALOR | EntryExpenseChart | Servicio + DTOs + endpoints; relación con rangos/lotes si aplica. |
| 5 | **Lavado de material** | 12-LAVADO MATERIAL M-LM; BD 28 cols (GARRAFAS, FRASCOS, etc.) | EntryMaterialWash | Servicio + DTOs (fecha, piezas, tipo Carboy/Flask, analista, supervisor) + endpoints. |
| 6 | **Preparación de soluciones** | 14-PREPARACION SOLUCIONES M-SOL; SOLUCION, CONCENTRACION, CANTIDAD, CLAVE | EntrySolutionPrep, EntryWeighing | Servicio + DTOs + endpoints; vínculo con SOLUTION y Batch. |
| 7 | **Precisión / Tratamiento matraz / Otros** | MER y Excel según existan | EntryAccuracy, EntryFlaskTreatment | Mismo patrón: servicio + DTOs + endpoints cuando se priorice. |

Para cada módulo, la **información “de todos los documentos”** se usa así:

- **Excel**: columnas de la hoja BD (o hoja de datos) → campos del DTO y de la entidad; ejemplos de filas → casos de prueba y validaciones.
- **MER**: relaciones (folio_id, logbook_id, user_id, batch_id, etc.) y estados (Draft/Signed/Locked).
- **EXCEL_ESPECIFICACIONES.md**: mapeo exacto columna → campo para import/export.

### 2.3 Transversales (compartidos por todos los tipos)

- **Firmas (RF-02)**: Signature asociada a Entry; flujo “firmar → Signed/Locked”. Ya existe entidad Signature; falta flujo en servicios y API.
- **Ciclo de folios (RF-03)**: FolioBlock + Folio con rango (ej. 1–200); asignación de folio a nueva entrada según bitácora.
- **Alertas**: Entidad Alert; integración con reglas (ej. horno fuera de rango → UI-02).
- **Catálogos**: CRUD o al menos lectura de Reagent, Solution, Batch, Supply para rellenar desplegables y validar claves en entradas.
- **Usuarios y roles (RF-01)**: Login (JWT), autorización por rol (Admin, Analyst, Sampler, Supervisor). User y Role ya existen; falta seguridad real en endpoints.

Cuando estos transversales estén implementados, **cada módulo de tipo de entrada** se apoya en los mismos folios, usuarios, firmas y catálogos, por eso el sistema resulta funcional de extremo a extremo.

---

## 3. Cómo mantenerlo escalable

### 3.1 Patrón por tipo de entrada (repetible)

Para que “toda la información de los documentos” siga convirtiéndose en software sin desorden:

1. **Entidad** (ya en `domain.entry`): tabla hija de Entry, campos según Excel/MER.
2. **Repository**: `JpaRepository<Entidad, Long>` + consultas por entry_id o logbook_id con `deleted_at IS NULL`.
3. **Interfaz de servicio**: `I*EntryService` con métodos explícitos (create, getByEntryId, listByLogbook, etc.).
4. **Implementación**: en `service.impl`, lógica de negocio (cálculos, validaciones, estados).
5. **DTOs**: request/response en `api.dto` (o `services.models.dtos` si se migra); nombres según columnas Excel cuando ayude.
6. **Controller**: bajo `/api/v1/entries/...`, solo delega en el servicio y devuelve DTOs.
7. **Opcional**: import/export Excel (Apache POI) usando EXCEL_ESPECIFICACIONES.md como contrato.

Así, **cada nuevo Excel o requisito de bitácora** se traduce en un nuevo “módulo de tipo de entrada” sin tocar el core.

### 3.2 Dónde vive la información (single source of truth)

- **MER**: modelo de datos y reglas (RF/RNF/UI) → entidades y estados.
- **Excel + excel_analysis_summary.md**: estructura real de hojas y columnas → DTOs y reglas de import/export.
- **EXCEL_ESPECIFICACIONES.md**: mapeo columna → campo → validaciones y nombres en código.
- **ANALISIS_Y_PROPUESTA_CCASA.md**: visión general y prioridades.
- **.cursor/rules/ccasa-backend-architecture.mdc**: convenciones (I*Service, *ServiceImpl, /api/v1/, excepciones, etc.) para que todo el código nuevo sea coherente.

Manteniendo estos documentos actualizados, el paso “documentos → software” sigue siendo claro y repetible.

### 3.3 Escalabilidad técnica

- **Base de datos**: Índices por logbook_id, folio_id, user_id, recorded_at en tablas de entradas; particionamiento por tiempo si crece mucho el volumen.
- **API**: Versionado `/api/v1/` ya aplicado; path params al final; DTOs estables para que el frontend (Next.js) pueda evolucionar por capas.
- **Frontend**: Un “tipo de entrada” = una (o varias) pantallas que consumen los mismos endpoints; dashboard 15 bitácoras (UI-01) como punto de entrada.

---

## 4. Resumen: de “toda la información” a software funcional y escalable

| Pregunta | Respuesta breve |
|----------|-----------------|
| **¿A qué se debe el diseño?** | Al MER (entidades, RF/RNF/UI), a los 28 Excel (hojas/columnas/datos) y a EXCEL_ESPECIFICACIONES.md (mapeo). Cada pieza del backend tiene un origen en esos documentos. |
| **¿Cómo se convierte en software funcional?** | Completando módulos por tipo de entrada (conductividad, horno, gastos, lavado, soluciones, etc.) con el mismo patrón ya usado en agua destilada, y cerrando transversales: firmas, ciclo folios, alertas, catálogos, auth. |
| **¿Cómo se mantiene escalable?** | Repitiendo el patrón Entity + Repository + I*Service + *ServiceImpl + DTOs + Controller (+ Excel opcional) por cada tipo; usando los mismos documentos como fuente de verdad; y respetando la regla de arquitectura del backend. |

El análisis (Excel + MER + docs) ya está hecho; la información está en `excel_analysis_summary.md`, `EXCEL_ESPECIFICACIONES.md` y `ANALISIS_Y_PROPUESTA_CCASA.md`. Convertirlo en software funcional y escalable es **aplicar el mismo patrón de “agua destilada” a cada tipo de entrada y a los transversales**, usando siempre esos documentos como referencia.
