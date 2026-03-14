# Análisis de documentación y propuesta de software ccasa

## 1. Contexto y fuentes analizadas

- **Directorio `docs`**: Toda la documentación relevante del proyecto está en `filesproyect`.
- **Documentación analizada**:
  - **MER_Bitacoras_Laboratorio (2).html**: modelo entidad-relación completo, entidades con atributos y auditoría, y trazabilidad requisitos funcionales (RF) / no funcionales (RNF) / UI.
  - **Excel**: 28 archivos .xlsx en `filesproyect` analizados con openpyxl (hojas, columnas y muestras de datos extraídos; ver sección 3).
  - **No analizados en detalle** (formato binario): `Manual de Procedimientos y Bitácoras (1).docx`, `Flujo Completo Bitacoras (1).pdf`. Recomendación: exportar secciones a texto o incluir descripciones en `docs/` para requisitos de proceso.

---

## 2. Resumen del MER (Sistema de Gestión Digital de Bitácoras de Laboratorio)

El MER define cuatro capas y una entrada genérica que se especializa en varios tipos.

### 2.1 Capas y entidades

| Capa                | Entidades                                      | Función                                    |
| ------------------- | ---------------------------------------------- | ------------------------------------------ |
| **Core**            | USER, ROLE, FOLIO_BLOCK, FOLIO, LOGBOOK, ENTRY | Acceso, folios y bitácoras                 |
| **Catalogs**        | REAGENT, REAGENT_JAR, BATCH, SOLUTION, SUPPLY  | Reactivos, lotes, soluciones, insumos      |
| **Logbook entries** | ENTRY + 10 tablas hijas (ver abajo)            | Registros específicos por tipo de bitácora |
| **Support**         | SIGNATURE, ALERT                               | Firma doble y alertas                      |

### 2.2 Tipos de entrada (Entry) y mapeo a Excel

- **ENTRY_CONDUCTIVITY**: Conductividad alta/baja → `2-CONDUCTIVIDAD ALTA/*.xlsx`, `3-CONDUCTIVIDAD BAJA/*.xlsx`
- **ENTRY_OVEN_TEMP**: Temperatura horno → `6-CARTA CONTROL HORNO DE SECADO/*.xlsx`
- **ENTRY_WEIGHING**: Pesada reactivo/solución → implícito en preparación soluciones
- **ENTRY_SOLUTION_PREP**: Preparación solución → `14-PREPARACION SOLUCIONES M-SOL/*.xlsx`
- **ENTRY_DISTILLED_WATER**: Agua destilada (pH/CE) → `1-AGUA DESTILADA 1-MT/*.xlsx`
- **ENTRY_MATERIAL_WASH**: Lavado material (Carboy/Flask) → `12-LAVADO MATERIAL M-LM/*.xlsx`
- **ENTRY_DRYING_OVEN**: Uso horno secado → `11-REGISTRO HORNO SECADO M-HS/*.xlsx`
- **ENTRY_ACCURACY**, **ENTRY_FLASK_TREATMENT**, **ENTRY_EXPENSE_CHART** → ver plan completo

### 2.3 Reglas de negocio clave (RF/RNF/UI)

- **RF-01** a **RF-10**: roles, doble firma, ciclo folios 200, gastos/inventario, conductividad, temperatura, soluciones, agua destilada, lavado, cartas Shewhart.
- **RNF-01**: Inmutabilidad (Locked tras firma). **RNF-02**: Seguridad (password_hash, HTTPS).
- **UI-01**: Dashboard 15 bitácoras. **UI-02**: Widget horno y alerta "Critical Oven".
- **Auditoría**: created_at, updated_at, deleted_at, created_by_user_id, updated_by_user_id, deleted_by_user_id en todas las tablas; soft delete.

---

## 3. Funcionalidad por tipo de archivo y análisis Excel

Ver documento [EXCEL_ESPECIFICACIONES.md](EXCEL_ESPECIFICACIONES.md) para columnas y hojas por plantilla.

Resumen: Agua destilada (BD: FOLIO, PH, CE, INICIALES, FIRMA), Conductividad alta/baja (hojas por fecha YYYYMMDD, 14 cols), Gastos (BD: ENAYO, INF, SUP, VALOR), Control horno (hojas por mes), Registro horno secado (FOLIO 1..200), Lavado material (BD: FECHA, G:, F:, GARRAFAS, FRASCOS), Preparación soluciones (BD: SOLUCION, CONCENTRACION, CANTIDAD, CLAVE), Listados (Reactivos y Equipos, Personal).

---

## 4. Propuesta de software modular y escalable

### 4.1 Stack

- **Backend**: Java 21, Spring Boot 4.x, Spring Data JPA, PostgreSQL. JWT, POI, JasperReports, Resilience4j, Micrometer, Redis, Caffeine, Spring Mail.
- **Frontend**: Next.js, TypeScript, Node (ccasaFrontend).
- **Base de datos**: PostgreSQL.

### 4.2 Arquitectura backend

- Módulo **core**: User, Role, FolioBlock, Folio, Logbook, Entry (auditoría).
- Módulo **bitácoras**: ciclo folios (RF-03), estados Draft/Signed/Locked.
- Módulo **firmas y alertas**: Signature (RF-02), Alert.
- Módulo **catálogos**: Reagent, ReagentJar, Batch, Solution, Supply.
- Módulos por **tipo de entrada** (entidad + DTO + servicio + import/export Excel).
- Servicios transversales: cálculos, alertas, inmutabilidad, PDF, Excel.

### 4.3 Frontend

- Dashboard 15 bitácoras, formularios por ENTRY_*, widgets (horno, alertas), gestión usuarios/catálogos, reportes Shewhart y gastos.

### 4.4 Base de datos

- MER implementado en PostgreSQL; auditoría en todas las tablas; soft delete con `deleted_at IS NULL`.

---

## 5. Propuestas adicionales

- Importación/exportación masiva Excel, cartas de control interactivas, notificaciones por correo, API integración instrumentos, PWA, dashboard de cumplimiento.

---

## 6. Próximos pasos

1. Documentar Excel (columnas, validaciones) en docs/.
2. Implementar entidades JPA en ccasaBackend.
3. Definir API REST (endpoints, DTOs).
4. Priorizar core + un tipo de entrada (ej. agua destilada) y doble firma.
5. Unificar documentación (Manual/Flujo en docs/ cuando se extraiga texto).
