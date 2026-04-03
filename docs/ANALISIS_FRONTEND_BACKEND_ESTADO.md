# Análisis: estado del frontend ccasa y brechas del backend

**Fecha de referencia:** 2 de abril de 2026  
**Alcance:** `ccasaFrontend` (Next.js) y `ccasaBackend` (Spring Boot), según código del repositorio.

Este documento resume qué está implementado en el front, qué API consume, y qué falta o está desalineado en el backend (y en la integración UI ↔ API). Sirve como contexto para planificación o para otro asistente (p. ej. Claude).

---

## 1. Stack y convenciones

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js (App Router), MUI, plantilla admin (menú vertical, vistas login/register del template) |
| Cliente HTTP | `fetch` vía `apiFetch` en `ccasaFrontend/src/lib/ccasa/api.ts` |
| Base URL API | `NEXT_PUBLIC_API_BASE_URL` (por defecto `http://localhost:8080`) |
| Auth | JWT en `localStorage`; `AuthContext` envía `Authorization: Bearer …` |
| Registro de rutas API | `ccasaFrontend/src/configs/backendApiRegistry.ts` (alineado con controladores Java) |

---

## 2. Estado del frontend

### 2.1 Integración real con el backend

**Autenticación**

- Login: `POST /api/v1/auth/login` — implementado en `AuthContext.tsx`.

**Bitácoras y entradas**

- Listado de bitácoras: `GET /api/v1/logbooks` — componente `LogbooksPanel`.
- Entradas por bitácora: `GET /api/v1/entries/by-logbook/{logbookId}` — `EntriesByLogbookPanel`, ruta `/bitacoras/[logbookId]`.

**Listados CRUD genéricos (solo lectura en UI)**

El componente `CrudListPanel` hace **únicamente `GET`** y pinta tablas a partir de `CrudResponseDTO[]`. Se usa en:

- Núcleo Entry: `GET /api/v1/entries`
- Cada tipo de entrada (slug): `GET` sobre la base del `*CrudController` correspondiente (p. ej. `/api/v1/entry-distilled-water`, `/api/v1/entry-conductivity`, etc.)
- Folios y bloques: `/api/v1/folios`, `/api/v1/folio-blocks`
- Catálogos: reactivos, frascos, lotes, soluciones, insumos
- Soporte: usuarios (empleados), alertas, firmas, roles

**Menú lateral** (`VerticalMenu.tsx`): refleja las mismas áreas (bitácoras, entradas por tipo, catálogos, alertas, firmas, empleados, roles, configuración, documentación, plataforma/tenants).

### 2.2 Limitaciones importantes del frontend

1. **No hay UI de alta/edición/borrado** para la mayoría de recursos: el backend expone POST/PUT/DELETE en muchos `*CrudController` y en `LogbookController`, pero el front no ofrece formularios; solo listados GET.
2. **Agua destilada:** existen endpoints de dominio adicionales (`DistilledWaterController`: detalle por `entryId`, alta con DTO específico). La pantalla `EntradaTipoClient` **solo los menciona como texto**; el uso real es el CRUD genérico del `EntryDistilledWaterCrudController`.
3. **Registro / olvidé contraseña / Mi cuenta:** vistas del template; no hay uso evidente de `apiFetch` en `views/` para `POST /api/v1/auth/register` u otros. El registro **sí existe** en el backend.
4. **Configuración del laboratorio:** página placeholder (`ModulePlaceholder`), sin llamadas API.
5. **Catálogo Equipos:** la página indica explícitamente que la API aún no existe; en `backendApiRegistry.ts` el recurso `equipment` tiene `notImplemented: true`.
6. **Plataforma → Laboratorios (Super Admin):** contenido informativo; no consume API de tenants.

### 2.3 Rutas de documentación en la app

Bajo `/documentacion/...` hay resúmenes enlazados a documentos del repo (`EXCEL_ESPECIFICACIONES`, análisis resultados → software). No son endpoints del backend.

---

## 3. Estado del backend (inventario breve)

**Controladores presentes (referencia):** Auth, Logbook (lista + CRUD con `CrudRequestDTO`/`CrudResponseDTO`), Entry + EntryController (`by-logbook`), DistilledWater, múltiples `Entry*CrudController`, Folio/FolioBlock, catálogos (reagent, reagent-jar, batch, solution, supply), User/Role/Alert/Signature CRUD.

**Bitácoras:** `LogbookController` expone GET list/detail **y** POST/PUT/DELETE vía `LogbookCrudService`.

---

## 4. Brechas y desalineaciones (backend / dominio vs front y docs)

### 4.1 Catálogo de equipos

- El menú y el registro frontend prevén **equipos** (referencia Listados.xlsx).
- **No hay** controlador REST dedicado tipo `EquipmentCrudController` ni recurso bajo `/api/v1/...` para equipos.
- En entidades de entrada puede existir `equipment_key` (texto); eso **no sustituye** un catálogo maestro expuesto por API.

### 4.2 Multi-tenant / plataforma Super Admin

- JWT y `CcasaUserDetails` incluyen **`tenantId`**.
- La UI tiene ruta “Laboratorios (Super Admin)”.
- **No hay** `TenantController` (u homólogo) en el paquete de controllers revisado.
- La documentación de arquitectura del workspace describe el sistema de laboratorio en términos **single-tenant** por contexto de negocio; conviene explicitar en diseño si `tenantId` es solo preparación futura o si se implementará CRUD de tenants.

### 4.3 Configuración del laboratorio

- Pantalla en el front sin backend asociado visible: no hay recurso claro de “settings del laboratorio/tenant” en los controllers listados.

### 4.4 Auth: forgot-password

- `SecurityPathPatterns` incluye rutas públicas para **`/api/v1/auth/forgot-password`** (y variante sin prefijo `/api`).
- **`AuthController`** solo expone `login`, `register`, `init-admin`. El flujo de recuperación de contraseña **no está implementado** en ese controlador (o no aparece en el inventario habitual de endpoints).

### 4.5 Paridad con Excel / RF / import-export

- Los textos en `ccasaModules` y en documentos del repo (Excel, cartas de control, alertas de horno, etc.) describen funcionalidad **enriquecida**.
- El backend actual se centra en **CRUD genérico + algunos endpoints de dominio** (p. ej. agua destilada). **Import/export Excel**, reglas avanzadas de alertas y UI específica por hoja **no** están reflejados como API dedicada en el inventario de controllers.

---

## 5. Tabla resumen: front vs backend

| Área | Frontend | Backend API |
|------|----------|-------------|
| Login | Integrado | `POST /api/v1/auth/login` |
| Register (UI template) | No cableado de forma evidente | `POST /api/v1/auth/register` existe |
| Forgot password (UI template) | Template | Ruta pública declarada; endpoint en `AuthController` no visto |
| Bitácoras listado | GET | GET |
| Bitácoras CRUD desde UI | No | POST/PUT/DELETE en `LogbookController` |
| Entradas por bitácora | GET | GET `entries/by-logbook/{id}` |
| Entradas / tipos (tablas) | GET CRUD genérico | CRUD en `*CrudController` |
| Agua destilada DTO dominio | Solo documentado en pantalla | `DistilledWaterController` |
| Folios / bloques | GET | CRUD backend |
| Catálogos (reactivos, etc.) | GET | CRUD backend |
| Equipos | Pantalla “sin API” | **Falta** recurso REST |
| Alertas / firmas / roles / users | GET | CRUD backend |
| Config laboratorio | Placeholder | **Falta** API explícita |
| Tenants / Super Admin | Informativo | **Falta** `TenantController` o similar |

---

## 6. Conclusión operativa

- **Backend:** núcleo REST sólido para auth, bitácoras, entradas por tipo, catálogos principales, folios, usuarios, roles, alertas y firmas. Vacíos claros frente al menú y a la propuesta: **equipos**, **API de tenants y/o configuración**, **forgot-password** si se quiere cerrar el flujo del template, y **capas de dominio / import-export** si se busca paridad con Excel y RF.
- **Frontend:** fase **listados + login**; falta madurar **formularios CRUD**, **flujos de registro/recuperación**, **pantallas de configuración**, **equipos** cuando exista API, y **uso de endpoints de dominio** (p. ej. agua destilada) además del CRUD genérico.

---

## 7. Archivos clave para profundizar

| Propósito | Ruta |
|-----------|------|
| Registro API y slugs de entradas | `ccasaFrontend/src/configs/backendApiRegistry.ts` |
| Módulos de entrada (UI + hints doc) | `ccasaFrontend/src/configs/ccasaModules.ts` |
| Cliente HTTP | `ccasaFrontend/src/lib/ccasa/api.ts` |
| Listado genérico | `ccasaFrontend/src/components/ccasa/CrudListPanel.tsx` |
| Pantalla por tipo de entrada | `ccasaFrontend/src/app/(dashboard)/entradas/[slug]/EntradaTipoClient.tsx` |

---

*Documento generado para compartir contexto entre herramientas o personas; revisar el código ante cualquier cambio sustancial en el repo.*
