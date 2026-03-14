# Propuesta: software altamente modular, escalable y con buenas prácticas

Este documento define la **arquitectura modular**, las **funcionalidades que cubren todo lo que hacen los archivos** (MER, 28 Excel, especificaciones, flujo) y el **orden de implementación** para que el proyecto funcione de forma correcta.

---

## Contexto de uso: registro manual, sin sensores ni equipos externos

**El sistema no utiliza sensores ni dispositivos de medición automática.** La empresa no provee equipos de este tipo; el software se utilizará en la escuela (o en el laboratorio) en un contexto donde **todos los registros se introducen a mano** por el personal (analistas, supervisores, etc.).

- **Entrada de datos**: Todas las lecturas (pH, CE, conductividad, temperatura de horno, gastos, lavado de material, preparación de soluciones, etc.) se capturan mediante **formularios en la aplicación**: el usuario escribe o selecciona los valores después de realizar la medición o la actividad en el laboratorio.
- **Sin integración con instrumentos**: No hay APIs ni conexión con sensores, medidores ni equipos externos; no está en alcance del proyecto ni de la empresa.
- **Flujo de trabajo**: Medición o actividad en laboratorio → registro manual en la aplicación → firma y cierre según el flujo de bitácoras. Así es como funcionará el sistema en la práctica.

Este criterio debe tenerse en cuenta en el diseño de pantallas (formularios claros y fáciles de rellenar) y en la documentación; no se contemplan funcionalidades de adquisición automática de datos ni integración con hardware.

---

## Modelo SaaS multi-tenant (altamente escalable)

El sistema se plantea como **SaaS multi-tenant**: una sola aplicación sirve a **múltiples organizaciones** (empresas o laboratorios). Cada organización es un **tenant** con sus propios datos, configuración, hora y empleados. La contratación no es automática: un **Super Admin** da de alta manualmente cada tenant y su primer usuario; ese usuario administra su organización. **No se incluye pasarela de pago** en esta fase; la alta de clientes es manual.

### Alcance SaaS

- **Multi-tenant**: Cada empresa o laboratorio es un **tenant** (organización). Bitácoras, folios, entradas, usuarios, catálogos y alertas pertenecen siempre a un tenant; no se mezclan datos entre tenants.
- **Configuración por tenant**: Cada organización puede configurar:
  - **Hora / zona horaria**: para fechas y reportes (ej. América/Mexico_City).
  - **Datos de la empresa**: nombre, razón social, identificador, etc. (campos opcionales al inicio).
  - **Empleados**: usuarios del tenant (analistas, supervisores, muestreadores, admins de la organización).
- **Escalable**: Añadir un nuevo cliente = crear un nuevo tenant + usuario inicial; el resto del sistema (bitácoras, entradas, catálogos) es el mismo y se scopea por tenant.

### Roles: Super Admin vs administrador del tenant

| Rol | Quién | Alcance |
|-----|--------|---------|
| **Super Admin** | Operador de la plataforma (vos o equipo interno). | Crear/editar/listar **tenants** (empresas/laboratorios). Por cada tenant: dar de alta el **primer usuario** (admin del tenant), opcionalmente configurar nombre, timezone, etc. No administra los datos operativos (bitácoras, entradas) de cada cliente. |
| **Admin del tenant** (o “admin organización”) | Usuario inicial que crea el Super Admin al dar de alta el tenant. | Dentro de **su** tenant: gestionar **empleados** (altas, bajas, roles), **configuración** (hora, datos de la empresa), bitácoras, folios, catálogos, entradas y reportes. No ve datos de otros tenants. |
| **Resto de roles** (Analyst, Sampler, Supervisor) | Empleados del tenant. | Según RF-01: operar bitácoras y entradas dentro del tenant; permisos por rol sin acceso a configuración global del tenant. |

**Estándar habitual en B2B SaaS**: diseño “account-first”: primero existe el tenant (cuenta/organización), luego los usuarios pertenecen a ese tenant. El Super Admin no opera el negocio del cliente; solo da de alta la cuenta y el primer admin; ese admin administra todo lo demás.

### Onboarding manual (sin pasarela de pago)

- **Contratación**: Se permite “hacer la contratación” en el sentido de que el modelo soporta múltiples clientes (tenants), pero **el alta no es automática**. El Super Admin da de alta una **empresa/laboratorio** (tenant) y un **usuario** con rol de administrador de esa organización; a partir de ahí ese usuario gestiona empleados, configuración y datos.
- **Sin pasarela de pago**: No se integra Stripe, PayPal ni otra pasarela; no hay flujos de suscripción ni cobro automático. Si más adelante se añade facturación, se hará en un módulo aparte sin cambiar el núcleo multi-tenant.

### Datos graduales (no todo obligatorio al inicio)

- Las organizaciones **no tienen que cargar todos sus datos desde el primer día**. Conviene que el modelo sea **modular y permisivo**:
  - **Configuración del tenant**: timezone, nombre de la empresa, etc. pueden ser opcionales o con valores por defecto; se completan cuando el cliente quiera.
  - **Empleados**: el admin del tenant puede ir dando de alta usuarios (empleados) de forma gradual; no es obligatorio tener toda la plantilla desde el inicio.
  - **Catálogos** (reactivos, soluciones, lotes): se pueden ir creando sobre la marcha; no exigen una carga masiva inicial.
- Los únicos datos mínimos razonables para “empezar” son: tenant creado por Super Admin + al menos un usuario (admin del tenant) para que pueda entrar y administrar. El resto puede ser opcional o completarse poco a poco.

### Estándar y modularidad (multi-tenant)

- **Aislamiento por tenant**: Todas las tablas operativas (logbook, folio, entry, user, catálogos, alertas, etc.) tienen `tenant_id` (o equivalente); las consultas siempre filtran por el tenant del usuario autenticado (extraído del JWT). Así se evita que un cliente vea datos de otro.
- **Onboarding atómico**: Crear un tenant debe ser una operación atómica: se crea el tenant + el primer usuario (admin) +, si aplica, configuración por defecto (timezone, etc.). Si algo falla, no se deja medio creado.
- **JWT y contexto**: El token incluye `tenantId` (y opcionalmente `role` a nivel tenant). En backend, un filtro o contexto (ej. `TenantContext`) establece el tenant actual por petición; servicios y repositorios lo usan para filtrar.
- **Módulo “Plataforma” (Super Admin)**: Separado del resto: endpoints y pantallas que solo ve el Super Admin (listar/crear/editar tenants, crear primer usuario del tenant). El resto de la app (bitácoras, entradas, empleados, configuración) es “por tenant” y lo usa el admin del tenant y los empleados.
- **Configuración del tenant**: Entidad o tabla `TenantConfig` (o campos en `Tenant`): timezone (IANA), nombre, datos fiscales o identificador, etc. Modular: se pueden añadir más campos después sin romper el flujo.

Con esto el sistema queda **SaaS altamente escalable**, con **configuración de hora, empresa y empleados por tenant**, **onboarding manual** (Super Admin da de alta empresa + usuario) y **sin pasarela de pago**; los datos pueden incorporarse de forma **gradual** sin exigir todo desde el primer día.

---

## 1. Arquitectura modular y escalable

### 1.1 Principios

- **Un tipo de bitácora = un módulo acotado**: misma frontera (Entity, Repository, I*Service, *ServiceImpl, Controller, DTOs). Añadir o cambiar un tipo no rompe el resto.
- **Transversales en un solo lugar**: folios, firmas, alertas, auth y catálogos son servicios/componentes compartidos; los módulos de entrada solo los consumen.
- **Contrato documento → código**: MER y EXCEL_ESPECIFICACIONES son la fuente de verdad; el código refleja ese contrato (nombres de campo, validaciones, estados).
- **API estable**: `/api/v1/`, DTOs versionables, path params al final; frontend y posibles integraciones dependen de un contrato claro.

### 1.2 Módulos del sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js) – Dashboard por tenant, formularios, widgets, reportes  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  API REST /api/v1/  (versionado, DTOs, tenant en JWT, errores estándar)     │
└─────────────────────────────────────────────────────────────────────────────┘
        │                                    │
        │  SUPER ADMIN (solo plataforma)     │  POR TENANT (empresa/lab)
        ▼                                    ▼
┌──────────────────────┐    ┌─────────────────────────────────────────────────┐
│ MÓDULO PLATAFORMA    │    │  Todos los módulos siguientes están SCOPEADOS    │
│ (Super Admin)        │    │  por tenant_id (empresa/laboratorio)             │
│ • Tenant (CRUD)      │    │  Config: hora (timezone), empresa, empleados     │
│ • Alta tenant +      │    └─────────────────────────────────────────────────┘
│   primer usuario     │         │                │                │
│ • Sin pasarela pago  │         ▼                ▼                ▼
└──────────────────────┘   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
                            │ CORE     │  │ CATÁLOGOS│  │ FIRMAS/  │  │ ALERTAS  │
                            │ Logbook  │  │ Reagent  │  │ FLUJO    │  │ Alert    │
                            │ Folio    │  │ Batch    │  │ Signature│  │ Reglas   │
                            │ Entry    │  │ Solution │  │ Folios   │  │          │
                            │ User     │  │ Supply   │  │ Estados  │  │          │
                            │ Role     │  │ (por     │  │          │  │          │
                            │ Auth/JWT │  │  tenant) │  │          │  │          │
                            └──────────┘  └──────────┘  └──────────┘  └──────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │ ENTRADAS     │  Agua dest., conductividad, horno,
                            │ (por tipo)   │  gastos, lavado, soluciones, etc.
                            └──────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERSISTENCIA (PostgreSQL) – tenant_id en tablas operativas, auditoría      │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Módulo Plataforma (Super Admin)**: Solo para rol Super Admin. Crear/editar/listar **Tenant** (empresa o laboratorio); al crear tenant, dar de alta de forma atómica el **primer usuario** (admin del tenant). Sin pasarela de pago.
- **Configuración por tenant**: Entidad/config **Tenant** (o TenantConfig): **hora/zona horaria** (IANA), **datos de la empresa** (nombre, identificador; opcionales). **Empleados** = usuarios del tenant (User con tenant_id); el admin del tenant los gestiona.
- **Core (por tenant)**: Bitácoras, folios, entradas, usuarios y roles **siempre asociados a un tenant**; JWT lleva tenantId; consultas filtradas por tenant.
- **Catálogos**: datos maestros que usan las entradas (reactivos, lotes, soluciones, insumos). CRUD o al menos lectura + búsqueda.
- **Firmas / Flujo**: doble firma (RF-02), ciclo de folios (RF-03), transición Draft → Signed → Locked (RNF-01). Servicios que exponen “asignar folio”, “firmar entrada”, “bloquear”.
- **Alertas**: entidad Alert + motor de reglas (ej. temperatura horno fuera de rango → UI-02). Notificaciones y listado de alertas activas.
- **Entradas (por tipo)**: cada tipo de bitácora es un submódulo con su entidad, repositorio, interfaz de servicio, implementación, DTOs y controller. Opcional: import/export Excel según EXCEL_ESPECIFICACIONES.

### 1.3 Buenas prácticas aplicadas

| Área | Práctica |
|------|----------|
| **API** | Versionado `/api/v1/`, path params al final, métodos HTTP correctos (GET/POST/PUT/PATCH/DELETE), códigos de estado coherentes. |
| **DTOs** | Request/Response separados; validación con Bean Validation; no exponer entidades. |
| **Errores** | Excepciones de negocio (*NotFoundException, etc.) y manejador global con cuerpo estándar (code, message, timestamp). |
| **Seguridad** | JWT, roles (Admin, Analyst, Sampler, Supervisor), contraseñas hasheadas (RNF-02); en producción HTTPS. |
| **Persistencia** | Auditoría (created_at, updated_at, deleted_at, created_by, etc.), soft delete, índices por logbook_id, folio_id, user_id, recorded_at. |
| **Código** | Interfaces de servicio (I*Service), implementaciones en *ServiceImpl; inyección por constructor; sin lógica en controladores. |
| **Documentación** | MER y EXCEL_ESPECIFICACIONES como contrato; docs en `docs/`; regla de arquitectura en `.cursor/rules/`. |

---

## 2. Matriz: archivos → funcionalidades (qué debe hacer el software)

Cada fila es una **capacidad** que el sistema debe ofrecer para “solventar” lo que hoy hacen los documentos y Excel. La implementación se reparte en los módulos anteriores.

### 2.1 MER (HTML) – Reglas y entidades

| Requisito / Entidad | Funcionalidad en el software |
|---------------------|------------------------------|
| **RF-01** Roles | Auth: login (JWT), roles Admin/Analyst/Sampler/Supervisor; permisos por endpoint según rol. |
| **RF-02** Doble firma | Módulo firmas: registrar firma analista + supervisor; transición a Signed; opcional segundo paso a Locked. |
| **RF-03** Ciclo folios 200 | Core: FolioBlock + Folio (rango 1–200); servicio “siguiente folio disponible” por bitácora; asignación al crear entrada. |
| **RF-04** Gastos / inventario | Módulo entrada ENTRY_EXPENSE_CHART + catálogos (Batch, Supply si aplica); cartas de gastos CE/pH. |
| **RF-05** Conductividad | Módulo entrada ENTRY_CONDUCTIVITY (alta/baja); lecturas y rangos según Excel. |
| **RF-06** Temperatura horno | Módulo entrada ENTRY_OVEN_TEMP; registro por día/mes; integración con alertas (UI-02). |
| **RF-07** Soluciones | Catálogo Solution + módulo ENTRY_SOLUTION_PREP y ENTRY_WEIGHING; concentración, cantidad, clave. |
| **RF-08** Agua destilada | Módulo entrada ENTRY_DISTILLED_WATER (ya implementado): pH/CE, promedios, is_acceptable, lote. |
| **RF-09** Lavado material | Módulo entrada ENTRY_MATERIAL_WASH: fecha, piezas, tipo Carboy/Flask, analista, supervisor. |
| **RF-10** Cartas Shewhart | ENTRY_OVEN_TEMP y ENTRY_EXPENSE_CHART con datos para gráficas de control; export/reporte. |
| **RNF-01** Inmutabilidad | Estados Draft → Signed → Locked; una vez Signed/Locked no se editan datos. |
| **RNF-02** Seguridad | Password hash, JWT, HTTPS en producción; no loguear datos sensibles. |
| **UI-01** Dashboard 15 bitácoras | Pantalla principal: lista de 15 bitácoras con resumen (ej. entradas recientes, estado). |
| **UI-02** Widget horno / Critical Oven | Widget en dashboard + alertas cuando temperatura fuera de rango. |
| **Auditoría** | Todas las entidades: created_at, updated_at, deleted_at, created_by_user_id, etc.; soft delete en consultas. |

### 2.2 Excel (28 archivos) – Tipos de bitácora y listados

| Origen Excel | Funcionalidad en el software |
|--------------|------------------------------|
| **1-AGUA DESTILADA 1-MT** (1-MT-02, 1-MT-03) | Registro de agua destilada por folio: pH, CE, promedios, lote, aceptabilidad; portada/identificación; reconocimiento de firmas. → **Módulo ENTRY_DISTILLED_WATER** (ya existe) + export/import Excel según hoja BD. |
| **2-CONDUCTIVIDAD ALTA** (20-108 … 20-114) | Registro por fecha (hojas YYYYMMDD), 14 columnas; tipo “alta”. → **Módulo ENTRY_CONDUCTIVITY** (alta): CRUD + import Excel por hoja/fecha. |
| **3-CONDUCTIVIDAD BAJA** (20-108-01 … 20-114-01, BCN) | Igual que alta, tipo “baja”; hoja BD con Fecha, F DISOLVENTE, F BALANZA, F HORNO, etc. → **Módulo ENTRY_CONDUCTIVITY** (baja) + import/export. |
| **4 Y 5-GASTOS** (CE, PH) | Cartas de gastos: ENAYO, INF, SUP, VALOR; rangos referencia. → **Módulo ENTRY_EXPENSE_CHART** + relación con lotes/rangos; export para gráficas. |
| **6-CARTA CONTROL HORNO** | Temperatura horno por mes; equipo, clave, días. → **Módulo ENTRY_OVEN_TEMP** + alerta “Critical Oven” (UI-02); export mensual. |
| **11-REGISTRO HORNO SECADO M-HS** | Uso del horno de secado: folio, reactivo, entrada/salida, analista, supervisor, cumple temp. → **Módulo ENTRY_DRYING_OVEN**. |
| **12-LAVADO MATERIAL M-LM** | Hoja BD: fecha, piezas, G/F, garrafas, frascos, analista, supervisor. → **Módulo ENTRY_MATERIAL_WASH**. |
| **14-PREPARACION SOLUCIONES M-SOL** (01, 02) | Solución, concentración, cantidad, clave; pesadas (ENTRY_WEIGHING). → **Módulo ENTRY_SOLUTION_PREP** + **ENTRY_WEIGHING** + catálogo Solution. |
| **Listados.xlsx** | Reactivos/Equipos (REACTIVOS, EQUIPOS), Personal (ANALISTA, MUESTREADOR, SUPERVISORES). → **Catálogos** Reagent, Solution, Equipment (si aplica), **User** con roles e iniciales. |

### 2.3 EXCEL_ESPECIFICACIONES.md – Import/export y validación

| Uso | Funcionalidad |
|-----|----------------|
| Mapeo columna → campo | Por cada tipo de entrada: definición de DTOs y validaciones alineadas con las columnas; import Excel (Apache POI) leyendo hoja BD o equivalente y rellenando entidad/DTO; export generando Excel con mismas columnas. |
| Validaciones | Rangos numéricos (pH, CE, temperatura), obligatoriedad de folio/logbook/user, claves de solución/reactivo existentes en catálogos. |

### 2.4 Flujo / Manual (PDF/DOCX)

| Concepto | Funcionalidad |
|---------|----------------|
| Ciclo de folios | Asignación automática o manual de folio al crear entrada; bloque de folios 1–200 por bitácora; consulta “siguiente folio disponible”. |
| Reconocimiento de firmas | Portada/registro “quién entrega / quién recibe”; asociado a bitácora o bloque; puede ser metadato o entidad según diseño. |
| Procedimientos | Texto/PDF en docs o en la app (ayuda); el software implementa los *estados* y *datos* (folios, firmas, Locked), no necesariamente el texto del manual. |

---

## 3. Funcionalidades propuestas (listado que solventa “todo”)

Agrupadas por módulo para implementación ordenada.

### 3.0 Módulo Plataforma (SaaS) y Tenant

- **Super Admin**: listar **tenants** (empresas/laboratorios); **crear tenant** de forma atómica junto con el **primer usuario** (admin del tenant); editar datos básicos del tenant si aplica.
- **Configuración del tenant** (gestionada por el admin del tenant): **hora / zona horaria** (ej. America/Mexico_City); **datos de la empresa** (nombre, razón social, identificador; campos opcionales, datos graduales).
- **Empleados**: el admin del tenant da de alta/baja usuarios (empleados) de su organización; cada usuario pertenece a un solo tenant y tiene un rol (Admin, Analyst, Sampler, Supervisor) dentro de ese tenant.
- **Aislamiento**: Todas las consultas de bitácoras, entradas, catálogos, etc. filtradas por `tenant_id` del JWT; el usuario solo ve y opera datos de su tenant.
- **Fuera de alcance en esta fase**: pasarela de pago, suscripciones automáticas, facturación integrada.

### 3.1 Módulo Core (por tenant)

- Listar y obtener **bitácoras** (15 por tenant); filtro activas (no borradas).
- **Folios**: listar por bitácora, obtener siguiente folio disponible, asociar folio a entrada al crear.
- **FolioBlock**: gestión de bloques (inicio–fin) por bitácora si el modelo lo usa.
- **Entry** genérico: crear (con folio, logbook, user), estados Draft/Signed/Locked; no editar cuando no sea Draft.
- **User**: alta/baja, edición perfil, listado por rol; **Role**: lectura (Admin, Analyst, Sampler, Supervisor).
- **Auth**: login (email/password) → JWT; refresh token opcional; endpoints protegidos por rol.

### 3.2 Módulo Catálogos

- **Reagent**: CRUD o al menos listado + búsqueda; usado en horno secado, soluciones.
- **ReagentJar**: si aplica (frascos de reactivo).
- **Batch**: CRUD/listado; usado en agua destilada (water_batch_id), gastos.
- **Solution**: CRUD/listado (nombre, concentración, cantidad, clave); usado en preparación soluciones.
- **Supply**: CRUD/listado para insumos (gastos/inventario).
- **Listados** (equipos/personal): si hay entidad Equipment, CRUD; “personal” = User con roles e iniciales (ya en Core).

### 3.3 Módulo Firmas y flujo

- **Registrar firma** en una entrada (analista y/o supervisor); transición Draft → Signed.
- **Bloquear** entrada (Signed → Locked); ya no editable (RNF-01).
- **Ciclo folios**: al crear entrada, asignar folio del bloque correspondiente a la bitácora (RF-03).
- **Reconocimiento de firmas** (entrega/recibe): si se modela como datos, endpoint de lectura/escritura; si solo documento, referencia en portada/export.

### 3.4 Módulo Alertas

- **Crear alerta** (manual o por regla): tipo (ej. horno crítico), mensaje, prioridad, usuario destino, leída/no leída.
- **Reglas**: al guardar ENTRY_OVEN_TEMP, si temperatura fuera de rango → crear alerta “Critical Oven” (UI-02).
- **Listar alertas** del usuario actual; marcar como leída.

### 3.5 Módulos de entrada (por tipo)

Cada uno: **crear**, **obtener por id de entrada**, **listar por bitácora (o por folio)**; opcional **import/export Excel** según EXCEL_ESPECIFICACIONES.

| Módulo | Funcionalidades concretas |
|--------|---------------------------|
| **Agua destilada** (ya hecho) | Crear, obtener por entry id; cálculos pH/CE promedio, is_acceptable; lote opcional. |
| **Conductividad (alta/baja)** | Crear/editar por fecha; 14 campos según Excel; tipo High/Low; import Excel por hoja YYYYMMDD. |
| **Temperatura horno (carta control)** | Crear por mes/día; equipo, clave; disparar alerta si fuera de rango; export mensual. |
| **Horno de secado (uso)** | Crear: reactivo, hora entrada/salida, analista, supervisor, cumple temp; listar por bitácora. |
| **Gastos (cartas)** | Crear: enayo, INF, SUP, valor, rangos; vínculo con lotes; export para gráficas Shewhart. |
| **Lavado material** | Crear: fecha, número piezas, tipo (Carboy/Flask), garrafas/frascos, analista, supervisor. |
| **Preparación soluciones** | Crear: solución (catálogo), concentración, cantidad, clave; pesadas (ENTRY_WEIGHING) si aplica. |
| **Precisión / Tratamiento matraz** | Cuando se priorice: mismo patrón CRUD + DTOs según MER/Excel. |

### 3.6 Funcionalidades transversales de aplicación

- **Dashboard (UI-01)**: pantalla con 15 bitácoras; por cada una, resumen (últimas entradas, estado).
- **Widget horno (UI-02)**: en dashboard, indicador de estado de temperatura horno + alertas “Critical Oven”.
- **Reportes**: export PDF (JasperReports) de una bitácora o rango de fechas; export Excel por tipo de entrada según plantilla.
- **Búsqueda global**: por folio, fecha, usuario, tipo de entrada (opcional, según necesidad).

---

## 4. Orden de implementación para que el proyecto funcione correctamente

Implementar en este orden evita bloqueos y deja un flujo usable en cada fase.

### Fase 1 – Base (ya en gran parte hecha)

1. **Core**: Logbook, Folio, FolioBlock, Entry (estados), User, Role; API de logbooks y entries por bitácora.
2. **Un tipo de entrada completo**: Agua destilada (crear, consultar, promedios).
3. **Excepciones y convenciones**: GlobalExceptionHandler, excepciones de negocio; regla de arquitectura.
4. **Configuración**: H2 dev, PostgreSQL prod; UTC; seguridad permitAll en dev para /api/v1/**.

**Resultado**: se pueden listar bitácoras, crear y ver entradas de agua destilada; el backend compila y pasa tests.

### Fase 1.5 – SaaS multi-tenant (recomendada antes de escalar)

5a. **Entidad Tenant**: tabla `tenant` (id, nombre, slug o identificador, timezone por defecto, datos opcionales de empresa); auditoría y soft delete.
5b. **User y datos operativos con tenant_id**: User, Logbook, Entry, Folio, catálogos, Alert, etc. con `tenant_id`; índices y FKs; migraciones si ya hay datos.
5c. **Super Admin**: rol/platforma (ej. `SUPER_ADMIN`); endpoints solo para este rol: listar tenants, crear tenant + primer usuario (admin del tenant) en una transacción atómica; JWT del Super Admin sin tenant o con tenant null para estos endpoints.
5d. **Contexto tenant en JWT**: login devuelve `tenantId` (y roles del tenant); filtro o contexto que establece el tenant por petición; servicios y repositorios filtran por tenant.
5e. **Configuración del tenant**: edición de timezone y datos de empresa (por el admin del tenant); empleados = CRUD de User scoped por tenant.

**Resultado**: múltiples empresas/laboratorios aislados; Super Admin da de alta cada uno con un usuario; ese usuario administra hora, empresa y empleados; no hay pasarela de pago.

### Fase 2 – Transversales

6. **Auth**: login con JWT (incluye tenantId y rol); proteger endpoints por rol y por tenant; User desde SecurityContext en servicios.
7. **Catálogos**: APIs de lectura (y si aplica CRUD) para Reagent, Batch, Solution, Supply por tenant; usados en desplegables y validaciones.
8. **Ciclo de folios**: servicio “siguiente folio” por bitácora (por tenant); asignación al crear cualquier entrada.
9. **Firmas**: registrar firma en entrada; transición Draft → Signed → Locked; no permitir edición en Signed/Locked.

**Resultado**: flujo completo “crear entrada → asignar folio → firmar → bloquear”; catálogos disponibles para formularios.

### Fase 3 – Resto de tipos de entrada

10. Implementar, **uno por uno**, los módulos de entrada que faltan (conductividad, horno temp, horno uso, gastos, lavado, preparación soluciones), siguiendo el mismo patrón que agua destilada (Entity, Repository, I*Service, *ServiceImpl, DTOs, Controller).
11. Para cada tipo, opcional: import/export Excel según EXCEL_ESPECIFICACIONES.

**Resultado**: todas las bitácoras representadas en Excel tienen su equivalente en el sistema.

### Fase 4 – Alertas y UX

12. **Alertas**: entidad Alert, regla “temperatura horno fuera de rango → Critical Oven”, API listar/marcar leída.
13. **Frontend**: dashboard 15 bitácoras (UI-01), widget horno (UI-02), formularios por tipo de entrada, listados de entradas por bitácora (por tenant).
14. **Reportes**: export PDF y Excel por bitácora o por tipo.

**Resultado**: sistema usable de punta a punta, con alertas y reportes básicos.

### Fase 5 – Robustez y mejoras

15. Tests de integración por módulo; validaciones exhaustivas; documentación OpenAPI/Swagger.
16. Import/export masivo Excel; cartas de control interactivas; notificaciones por correo (Spring Mail); PWA si aplica.

**Fuera de alcance (contexto de uso):** integración con sensores, medidores o instrumentos; la empresa no provee este tipo de equipos y todos los datos se registran manualmente en la aplicación. **Pasarela de pago:** no se incluye en esta fase; el alta de clientes (tenants) es manual por el Super Admin.

---

## 5. Evolución hacia mini-LIMS SaaS (innovaciones y roadmap)

El sistema actual está muy bien planteado arquitectónicamente (multi-tenant, modular, MER + Excel como contrato) y se parece a un **ELN + bitácora digital** (Electronic Lab Notebook). Los LIMS profesionales (LabWare, STARLIMS, LabVantage, Benchling, OpenLIMS) gestionan todo el flujo del laboratorio: muestras, análisis, calidad, cumplimiento, inventarios, reportes. La evolución natural de ccasa es convertirlo **gradualmente** en un **mini-LIMS SaaS**, añadiendo módulos sin romper lo ya construido. Todo se mantiene con **registro manual** (sin sensores ni adquisición automática) y dentro del modelo multi-tenant ya definido.

### 5.1 Los 6 dominios de los LIMS reales y qué tenemos ya

| Dominio | Qué hacen los LIMS | Qué tiene ccasa hoy |
|---------|--------------------|----------------------|
| Gestión de muestras | Registro, trazabilidad, estado | — (pendiente) |
| Gestión de análisis | Métodos, resultados | Bitácoras y entradas (actividades); no “resultados analíticos” como entidad |
| Control de calidad | Validaciones, control estadístico | Firmas, estados Draft/Signed/Locked; cartas de control (RF-10) en Excel; alertas |
| Inventario laboratorio | Reactivos, lotes, caducidad | Catálogos Reagent, Batch, Solution, Supply (base lista) |
| Cumplimiento regulatorio | Auditoría, firmas electrónicas | Auditoría en entidades, doble firma (RF-02), Locked (RNF-01) |
| Reportes científicos | Resultados, gráficos, exportaciones | Export PDF/Excel previsto; reportes por bitácora |

Tenemos partes sólidas de **3–4 dominios**; los que más transforman el producto son **muestras** y **resultados de análisis** (pasar de “solo actividades” a “muestra → análisis → resultado”).

### 5.2 Mejoras a corto plazo (3–6 semanas)

No cambian la arquitectura; se añaden como módulos o extensiones.

| Mejora | Descripción adaptada a ccasa |
|--------|------------------------------|
| **Sistema de muestras** | Entidad `Sample` (tenant_id, sample_code, sample_type, collected_by, collected_at, location, status). Flujo: muestra recolectada → registrada en sistema (manual) → asignada a análisis/bitácora → resultados registrados → aprobada/rechazada. Trazabilidad científica; opcionalmente ligar entradas (Entry) a una muestra. |
| **Resultados de análisis** | Entidad `AnalysisResult` (sample_id, method_id, parameter, value, unit, analyst, validated_by, recorded_at). Conecta con agua destilada (pH, CE), conductividad, temperatura horno. Los valores se siguen introduciendo a mano; la estructura permite reportes y gráficos por muestra/parámetro. |
| **Métodos analíticos** | Entidad `Method` (name, version, description, reference). Ej.: “pH measurement”, “ASTM D1293”. Las entradas o resultados referencian el método usado; todo registro manual. |
| **Control estadístico (Shewhart)** | Cálculo automático de media, desviación estándar, UCL/LCL a partir de los datos ya registrados (temperatura horno, conductividad, gastos). Gráficas en dashboard o reportes; sin sensores. |
| **Bitácoras inteligentes** | Validaciones automáticas (ej. si temperatura &gt; 120 → crear alerta) y mensajes de sugerencia (“¿Registrar incidente?”). Los datos siguen entrando por formulario. |

### 5.3 Mejoras a mediano plazo (2–4 meses)

El sistema se acerca a un LIMS completo manteniendo registro manual.

| Mejora | Descripción adaptada a ccasa |
|--------|------------------------------|
| **Inventario de laboratorio** | Extender catálogos: `InventoryItem` / `InventoryBatch` con cantidad, ubicación, fecha caducidad, proveedor. Alertas de caducidad y stock mínimo; consumo asociado a entradas (opcional). |
| **Equipos de laboratorio** | Entidad `Equipment` (name, serial_number, calibration_date, next_calibration, status). Historial de calibración y mantenimiento; alertas de próxima calibración. Listados.xlsx ya referencia equipos; se formaliza en BD. |
| **Gestión documental (SOPs)** | Entidad `Document` (title, version, approved_by, effective_date, file). Versionado y control de procedimientos; sin sustituir al Manual/Flujo en PDF, pero sí registro de qué versión está vigente. |
| **Auditoría avanzada** | Tabla `AuditLog` (user, action, entity, entity_id, old_value, new_value, timestamp) para cambios críticos. Necesario en entornos regulados. |
| **Incidencias** | Entidad `Incident` (type, description, reported_by, severity, resolved). Ej.: “temperatura horno fuera de rango”; enlazable a Alert y a entradas. |
| **Reportes científicos** | Generación automática de informes PDF: resultados por muestra, gráficos de control de calidad, resumen por periodo; exportación estructurada. |

### 5.4 Innovaciones SaaS (diferenciadoras)

| Innovación | Descripción |
|------------|-------------|
| **Dashboard científico** | Widgets: muestras analizadas hoy, análisis pendientes, alertas, estado de control de calidad; todo por tenant. |
| **Timeline de laboratorio** | Vista cronológica: muestra creada → análisis iniciado → resultado validado → firma; mejora la trazabilidad visual. |
| **Formularios dinámicos** | Modelo `LogbookTemplate` (fields, validations) para que el admin del tenant defina o adapte bitácoras sin programar; evolución futura si se quiere máxima flexibilidad. |
| **Multi-laboratorio por tenant** | Un tenant (empresa) con varios “laboratorios” (química, microbiología, físico); filtro por laboratorio en bitácoras y muestras. Opcional según necesidad del negocio. |

### 5.5 Innovaciones más avanzadas (futuro)

Sin comprometer el alcance actual; se consideran cuando el producto esté maduro.

- **Machine learning para calidad**: detección de anomalías en mediciones (sobre datos ya registrados).
- **Predicción de calibración**: avisos del tipo “equipo con alta probabilidad de fallar calibración” según historial.
- **OCR para importar bitácoras físicas**: subir imagen/foto y extraer datos para rellenar borradores (registro sigue siendo “manual” en origen, pero asistido).
- **API pública**: `POST /api/v1/samples`, `POST /api/v1/results` para integraciones externas (p. ej. otros sistemas que envíen resultados ya validados); no sustituye el registro manual en la app.

### 5.6 Roadmap recomendado (alineado con las fases del documento)

| Mes | Enfoque (resumen) |
|-----|-------------------|
| **Mes 1** | Multi-tenant, firmas, folios, bitácoras por tipo, dashboard (Fases 1, 1.5, 2 y parte de 4). |
| **Mes 2** | Muestras (Sample), resultados de análisis (AnalysisResult), métodos analíticos (Method); enlazar entradas existentes a muestras donde aplique. |
| **Mes 3** | Inventario (extensión catálogos), equipos (Equipment), alertas avanzadas (caducidad, calibración). |
| **Mes 4** | Reportes científicos (PDF), auditoría completa (AuditLog), incidencias (Incident), estadísticas y dashboard científico. |

La **mejora más transformadora** a corto plazo es el **sistema de muestras + resultados de análisis**: convierte el producto de “bitácora digital” a “LIMS” manteniendo registro manual y la misma arquitectura modular. La arquitectura actual (módulos, multi-tenant, DTOs, servicios, separación de dominio) facilita añadir estos bloques sin reescribir el núcleo.

---

## 6. Resumen

| Pregunta | Respuesta |
|----------|-----------|
| **¿A qué se debe el diseño?** | Al MER (entidades, RF/RNF/UI), a los 28 Excel (estructura de datos por tipo de bitácora), a EXCEL_ESPECIFICACIONES (mapeo columna–campo) y al flujo (folios, firmas, estados). |
| **¿Cómo se hace modular y escalable?** | Módulos bien delimitados (Core, Catálogos, Firmas/Flujo, Alertas, Entradas por tipo); mismo patrón por tipo de entrada; transversales compartidos; API versionada y DTOs estables. |
| **¿Qué funcionalidades cubren “todo”?** | Matriz anterior: cada RF, cada Excel y cada concepto de EXCEL_ESPECIFICACIONES y flujo se traduce en una o varias funcionalidades concretas (listadas en §3). |
| **¿Cómo hacer que funcione correctamente?** | Respetar el orden de fases: 1) base y un tipo de entrada, 1.5) SaaS (tenant, Super Admin, config hora/empresa/empleados, aislamiento), 2) auth + catálogos + folios + firmas, 3) resto de tipos de entrada, 4) alertas + frontend + reportes, 5) tests y mejoras. |
| **SaaS** | Multi-tenant por empresa/laboratorio; Super Admin da de alta tenant + primer usuario (admin); ese admin configura hora, empresa y empleados; datos graduales (no todo obligatorio); sin pasarela de pago. |
| **Evolución mini-LIMS** | Hoy: ELN + bitácora digital. Roadmap §5: muestras + resultados de análisis (corto), inventario/equipos/auditoría/incidencias/reportes (mediano), dashboard científico y formularios dinámicos (SaaS); todo con registro manual, sin sensores. |

Con esta propuesta, el proyecto queda definido como un **SaaS altamente modular y escalable** que **solventa todo lo que hacen los archivos** (MER, Excel, especificaciones, flujo), con **multi-tenancy** (configuración de hora, empresa y empleados por organización, onboarding manual por Super Admin, sin pasarela de pago) y puede **funcionar de forma correcta** siguiendo las fases de implementación y las buenas prácticas indicadas.
