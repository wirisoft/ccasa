# QA — Hardening anti-duplicados PWA conductividad

Plan de pruebas para validar que el sistema offline **no genera duplicados**, **no pierde datos pendientes** y **optimiza correctamente la cola** antes de sincronizar.

> Este plan complementa a `QA_CONDUCTIVIDAD_OFFLINE_PWA.md` (flujo básico offline). Aquí se cubren los escenarios de **idempotencia, reconciliación y consistencia** agregados en el hardening.

---

## Prerrequisitos

1. Frontend en **modo producción** (`npm run build && npm run start`).
2. Abrir la aplicación en **Google Chrome** (recomendado versión 120+).
3. Usuario autenticado con permisos de conductividad y al menos **una bitácora activa**.
4. Al menos **un registro de conductividad existente** en el servidor (creado con red) para los tests de UPDATE y DELETE.

---

## Cómo abrir las herramientas en Chrome

### Abrir DevTools

- **Windows/Linux:** `F12` o `Ctrl + Shift + I`
- **Mac:** `Cmd + Option + I`

### Pestaña Network (para simular Offline)

1. En DevTools, click en la pestaña **Network** (Red).
2. Marcar la casilla **Offline** que aparece en la barra superior de la pestaña.
3. Cuando la casilla está marcada, Chrome simula que no hay red.
4. Para volver online: desmarcar la casilla **Offline**.

![Network Offline toggle](https://developer.chrome.com/static/docs/devtools/network/imgs/offline.png)

### Pestaña Application → IndexedDB (para inspeccionar la cola)

1. En DevTools, click en la pestaña **Application** (Aplicación).
2. En el panel izquierdo, expandir **IndexedDB**.
3. Expandir **`ccasa_conductivity_offline_v2`**.
4. Click en **`conductivity_outbox`** para ver los registros de la cola.
5. Para refrescar los datos: click derecho → **Refresh database** o el botón de recarga ↻.

> **Tip:** Si no ves la base de datos, recarga la página con red y vuelve a revisar.

### Pestaña Console (para ver logs)

1. En DevTools, click en la pestaña **Console** (Consola).
2. En el campo de filtro, escribe alguno de estos para filtrar logs relevantes:
   - `conductivitySyncEngine` — logs del motor de sincronización
   - `conductivityQueueOptimizer` — logs de optimización de cola
   - `conductivityMerge` — logs de la estrategia de merge
   - `TempId` — logs de reconciliación de IDs
3. Los logs tienen colores por nivel:
   - 🔵 **INFO** — operaciones normales (sync completado, registro encolado)
   - 🟡 **WARN** — advertencias (retry limit, registros recuperados)
   - 🔴 **ERROR** — errores (fallo de red, error al parsear)

> **En producción** los logs no se imprimen en console. Para verlos, escribir en la consola: `getLogBuffer()` y presionar Enter — muestra las últimas 200 entradas.

### Pestaña Network — ver peticiones reales al servidor

1. En la pestaña **Network**, asegurarse de que **Offline NO está marcado**.
2. En el filtro, seleccionar **Fetch/XHR** para ver solo las llamadas al API.
3. Aquí puedes contar cuántos POST, PUT o DELETE reales se enviaron.
4. Click en cualquier petición para ver el status code, body, headers, etc.

---

## A. RECONCILIACIÓN TEMPID → SERVERID (sin duplicados en UI)

### TC-H01 — CREATE offline: no debe haber fila duplicada tras sync

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | **Con red** (Offline desmarcado), abrir la vista de Conductividad. Contar cuántos registros hay en la tabla. | Ej: 5 registros. |
| 2 | En DevTools → pestaña **Network** → marcar casilla **Offline**. | El chip en la barra del panel cambia a **Sin conexión** (rojo). |
| 3 | Pulsar **Nuevo registro**, completar tipo=Alta, peso=0.7456, seleccionar bitácora, y pulsar **Guardar**. | El diálogo se cierra. Aparece toast: "Guardado en cola local…". La tabla ahora muestra **6 registros** — el nuevo tiene un chip **Local** azul y se ve con opacidad reducida. |
| 4 | En DevTools → pestaña **Application** → **IndexedDB** → `ccasa_conductivity_offline_v2` → `conductivity_outbox`. Click en el registro. | Debe haber 1 registro con `operationType: "CREATE"`, `status: "pending"`. El campo `localObjectId` debe empezar con `temp-` (ej: `temp-1713225600000-a3f2k`). |
| 5 | En DevTools → pestaña **Network** → **desmarcar** casilla **Offline**. | El chip cambia a **En línea** (verde) y empieza a pulsar (amarillo = sincronizando). El auto-sync inicia en ~1.5 segundos. |
| 6 | Esperar a que el chip deje de pulsar y quede verde fijo. Mirar la tabla. | La tabla sigue mostrando **6 registros totales** (NO 7). La fila que antes decía "Local" ahora muestra datos reales del servidor (folio, conductividad calculada, etc.). |
| 7 | En DevTools → pestaña **Console** → escribir `TempId` en el filtro. | Debe aparecer un log: `TempId reconciliado con servidor` con el `localObjectId` y `serverId` correcto. |
| 8 | En DevTools → pestaña **Application** → **IndexedDB** → `conductivity_outbox` → refrescar (↻). | El registro ahora tiene `status: "done"`. No debe quedar en `pending`. |

**✅ Pasa si:** la tabla muestra 6 registros (el nuevo solo una vez).
**❌ Falla si:** la tabla muestra 7 registros (duplicado: fila local + fila del servidor).

---

### TC-H02 — CREATE offline con fallo de red "online" (fallback a cola)

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red real activa, **apagar el backend** en el servidor (`sudo systemctl stop ccasa-backend`) pero mantener WiFi activo. | El navegador sigue diciendo `navigator.onLine = true` (tiene WiFi). |
| 2 | En la app, crear un nuevo registro de conductividad. | El POST falla con error de red (TypeError). El sistema detecta que es error de red y automáticamente encola. Toast: "Guardado en cola local…". |
| 3 | En DevTools → Application → IndexedDB → `conductivity_outbox`. | Hay 1 registro con `status: "pending"`, `localObjectId` que empieza con `temp-`. |
| 4 | Encender el backend de nuevo (`sudo systemctl start ccasa-backend`). Pulsar botón **Sincronizar ahora** en la barra del panel. | Sync exitoso. La tabla muestra el registro **sin duplicar**. |

---

### TC-H03 — Múltiples CREATEs offline: cada uno reconciliado individualmente

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Network → marcar **Offline**. | Chip rojo: "Sin conexión". |
| 2 | Crear **3 registros distintos**: peso=0.7400, peso=0.7500, peso=0.7600. | La tabla muestra 3 filas nuevas con chip "Local". En la barra: "3 pendientes". |
| 3 | Application → IndexedDB → `conductivity_outbox`: verificar 3 registros `pending`. | Cada uno tiene un `localObjectId` distinto (todos empiezan con `temp-`). |
| 4 | Network → desmarcar **Offline**. Esperar auto-sync (~1.5s). | El chip pulsa amarillo. Los 3 se sincronizan en orden FIFO. |
| 5 | Verificar la tabla cuando el chip queda verde. | **Exactamente 3 registros nuevos** del servidor (no 6). Ninguna fila con chip "Local". |
| 6 | Console → filtrar por `TempId`. | 3 logs `TempId reconciliado con servidor`, cada uno con un `serverId` distinto. |

---

## B. OPTIMIZACIÓN DE COLA (deduplicación)

### TC-H04 — UPDATE + UPDATE mismo registro: solo se envía el último

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | **Con red**, verificar que existe un registro en estado Draft (ej: id=42, peso=0.7400). | Registro visible en tabla con botones Editar y Eliminar. |
| 2 | Network → marcar **Offline**. | Chip rojo. |
| 3 | Editar el registro: cambiar peso a **0.7500**. Guardar. | Toast: "Actualización guardada en cola local". Barra: "1 pendiente". |
| 4 | Editar el **mismo registro** otra vez: cambiar peso a **0.7600**. Guardar. | Toast: "Actualización guardada en cola local". Barra: "2 pendientes". |
| 5 | Application → IndexedDB → `conductivity_outbox`: verificar 2 registros. | Ambos son `UPDATE`, ambos tienen el mismo `localObjectId` (ej: `resource-42`). |
| 6 | Network → desmarcar **Offline**. Esperar sync o pulsar **Sincronizar ahora**. | Console: log `múltiples UPDATE reducidos a uno`. En Network → Fetch/XHR: **solo 1 PUT** enviado. |
| 7 | Verificar tabla: el registro muestra peso **0.7600**. | El valor intermedio (0.7500) nunca llegó al servidor. |

**❌ Falla si:** en la pestaña Network aparecen 2 llamadas PUT al API.

---

### TC-H05 — UPDATE + DELETE mismo registro: solo se envía DELETE

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | **Con red**, verificar un registro Draft existente (ej: id=50). | Visible en tabla. |
| 2 | Network → marcar **Offline**. | Chip rojo. |
| 3 | Editar el registro (cambiar peso). Guardar. | Barra: "1 pendiente" (UPDATE). |
| 4 | Eliminar el **mismo registro**. Confirmar. | Barra: "2 pendientes" (UPDATE + DELETE). Registro desaparece de la tabla. |
| 5 | Application → IndexedDB → `conductivity_outbox`: verificar 2 registros. | Ambos con `localObjectId: "resource-50"`. Uno es UPDATE, otro DELETE. |
| 6 | Network → desmarcar **Offline**. Sync. | Console: `UPDATE(s)+DELETE reducidos a DELETE`. Network: **solo 1 DELETE** enviado. |
| 7 | Verificar tabla: registro eliminado. | No reaparece al recargar. |

---

### TC-H06 — CREATE duplicado (doble-click): solo se envía uno

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Network → marcar **Offline**. | Chip rojo. |
| 2 | Crear un registro. Luego crear **otro registro con exactamente los mismos datos** (mismo tipo, peso, bitácora). | Barra: "2 pendientes". Tabla: 2 filas locales. |
| 3 | Application → IndexedDB → `conductivity_outbox`: 2 CREATEs. | Mismos `endpoint` y `payload`, pero `localObjectId` distinto. |
| 4 | Network → desmarcar **Offline**. Sync. | Console: `CREATE duplicado eliminado`. Network: **solo 1 POST** enviado. |
| 5 | Verificar tabla: **1 registro** nuevo, no 2. | Solo una fila real del servidor. |

---

## C. MERGE STRATEGY (protección de datos locales)

### TC-H07 — Registro con DELETE pendiente no reaparece tras refetch

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | **Con red**, anotar cantidad de registros en tabla (ej: 8) y que hay un Draft (ej: id=60). | 8 registros visibles. |
| 2 | Network → marcar **Offline**. | Chip rojo. |
| 3 | Eliminar el registro id=60. Confirmar. | Tabla: 7 registros. Barra: "1 pendiente" (DELETE). |
| 4 | Network → desmarcar **Offline**. La tabla se actualiza (fetchRecords trae datos del servidor). | El servidor aún tiene el registro (el DELETE no se ejecutó todavía). |
| 5 | Verificar tabla: el registro id=60 **NO debe reaparecer**. | Sigue sin mostrarse. La merge strategy lo excluye porque hay un DELETE pendiente en la cola. |
| 6 | Esperar que el sync termine. | DELETE se ejecuta en servidor. Registro eliminado definitivamente. |

**❌ Falla si:** al restaurar red el registro reaparece momentáneamente en la tabla.

---

### TC-H08 — Registro con UPDATE pendiente mantiene cambios locales tras refetch

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | **Con red**, verificar un registro Draft (ej: id=70, peso=0.7400). | Visible en tabla. |
| 2 | Network → marcar **Offline**. | Chip rojo. |
| 3 | Editar el registro: cambiar peso a **0.9999**. Guardar. | Tabla muestra peso 0.9999. Barra: "1 pendiente". |
| 4 | Network → desmarcar **Offline**. `fetchRecords` trae datos del servidor (con peso original 0.7400). | La merge strategy detecta el UPDATE pendiente y aplica los cambios locales sobre los datos del servidor. |
| 5 | Verificar tabla: peso = **0.9999** (no 0.7400). | El cambio local no se perdió por el refetch. |
| 6 | Esperar sync completo. | PUT se ejecuta. Servidor actualizado a 0.9999. |

---

### TC-H09 — CREATE local se preserva tras refetch

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Network → marcar **Offline**. Crear un registro (tipo=Baja, peso=0.5000). | Tabla muestra fila con chip "Local". Barra: "1 pendiente". |
| 2 | Network → desmarcar **Offline** (fetchRecords se dispara automáticamente). | La tabla se actualiza con datos del servidor. |
| 3 | Verificar tabla: la fila local (chip "Local") **sigue visible**. | No desapareció con el refetch. |
| 4 | Esperar sync. | CREATE se ejecuta. Fila local se reemplaza por fila real del servidor. |

---

## D. RECUPERACIÓN DE REGISTROS ATASCADOS

### TC-H10 — Registro en syncing se recupera tras restart

> **Nota:** Este test requiere editar valores manualmente en IndexedDB. Es un test de resiliencia avanzado.

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Network → marcar **Offline**. Crear un registro. | Barra: "1 pendiente". |
| 2 | En Application → IndexedDB → `conductivity_outbox`: hacer **doble click** en el campo `status` del registro y cambiarlo a `syncing`. Cambiar `updatedAt` a `Date.now() - 120000` (un valor de hace 2 min). Presionar Enter para confirmar. | Simula un crash a mitad de sincronización. |
| 3 | Network → desmarcar **Offline**. Pulsar **Sincronizar ahora**. | Console: `Recuperados 1 registro(s) atascados en syncing`. |
| 4 | El registro se procesa normalmente y aparece en la tabla. | Sync exitoso. Registro creado en servidor. |

---

## E. RETRY Y CONTROL DE FALLOS

### TC-H11 — Fallo permanente no bloquea la cola

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Network → marcar **Offline**. Crear **2 registros** (A y B con pesos distintos). | Barra: "2 pendientes". |
| 2 | En Application → IndexedDB → `conductivity_outbox`: cambiar el `endpoint` del registro A a `/api/v1/conductivity-records-INVALID`. | Esto forzará un error 404 cuando intente sincronizar A. |
| 3 | Network → desmarcar **Offline**. Sync. | A falla con 404 → `failed_permanent`. B se envía correctamente → `done`. |
| 4 | Verificar: aparece sección **Errores de sincronización** con registro A. B aparece en la tabla como registro real del servidor. | A no bloqueó a B. |

---

### TC-H12 — Reintentar operación fallida

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Tras TC-H11, hay un registro en la sección **Errores de sincronización**. | Visible con botones **Reintentar** y **Eliminar**. |
| 2 | En Application → IndexedDB: corregir la URL del registro fallido, cambiarla de vuelta a `/api/v1/conductivity-records`. | Preparación para retry exitoso. |
| 3 | Pulsar botón **Reintentar** en la sección de errores. | Console: `Registro reseteado para reintento`. Se dispara sync automáticamente. |
| 4 | Verificar: registro se sincroniza exitosamente. Desaparece de la sección de errores y aparece en la tabla. | En IndexedDB: status cambió a `done`. |

---

### TC-H13 — Eliminar operación fallida

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Tener un registro `failed_permanent` visible en la sección **Errores de sincronización**. | Visible con botón **Eliminar**. |
| 2 | Pulsar botón **Eliminar**. | La operación desaparece de la sección de errores. |
| 3 | En Application → IndexedDB → `conductivity_outbox` → refrescar (↻). | El registro fue eliminado del outbox. No queda rastro. |

---

## F. IDEMPOTENCIA EN ESCENARIOS EDGE

### TC-H14 — Cerrar pestaña durante sync y reabrir

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Network → marcar **Offline**. Crear un registro. | Barra: "1 pendiente". |
| 2 | Network → desmarcar **Offline**. Inmediatamente **cerrar la pestaña** (Ctrl+W) antes de que el sync termine. | El sync se interrumpe a mitad. |
| 3 | Reabrir la pestaña de conductividad (Ctrl+Shift+T o navegar de nuevo). | El sistema carga. El registro puede estar en `syncing` (atascado) o `pending` en IndexedDB. |
| 4 | Esperar sync automático (~1.5s) o pulsar **Sincronizar ahora**. | Si estaba en `syncing`, `recoverStuckSyncing` lo resetea a `pending` y lo procesa. |
| 5 | Verificar tabla: **solo 1 registro** creado en el servidor. | No hay duplicado. |

---

### TC-H15 — Sync en dos pestañas simultáneas

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | En pestaña A: Network → marcar **Offline**. Crear un registro. | Barra: "1 pendiente". |
| 2 | Abrir **pestaña B** (Ctrl+T) y navegar a la misma vista de conductividad. | Pestaña B carga la tabla normalmente. |
| 3 | En pestaña A: Network → desmarcar **Offline**. Ambas pestañas detectan `online`. | Solo **UNA** pestaña ejecuta el sync (lock `isSyncing`). La otra recibe `skipped`. |
| 4 | Verificar en **ambas** pestañas: la tabla muestra el registro una sola vez. | BroadcastChannel sincroniza el estado entre tabs. |
| 5 | Verificar en servidor (o en Network de cualquier pestaña): **solo 1 POST** enviado. | El lock a nivel módulo previene doble ejecución. |

---

### TC-H16 — Red intermitente durante sync

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Network → marcar **Offline**. Crear **3 registros** con pesos distintos. | Barra: "3 pendientes". |
| 2 | Network → desmarcar **Offline**. Cuando veas en Network que el primer POST sale, inmediatamente volver a marcar **Offline**. | Registro 1: probablemente `done`. Registro 2: puede quedar `failed_retryable` o `syncing`. Registro 3: `pending`. |
| 3 | Network → desmarcar **Offline** de nuevo. Esperar auto-sync (~1.5s). | Registros 2 y 3 se procesan. Si 2 estaba `syncing` + viejo → se recupera automáticamente. |
| 4 | Verificar tabla: **exactamente 3 registros** nuevos en el servidor. | Ningún duplicado, ninguno perdido. |

---

## G. LOGS Y OBSERVABILIDAD

### TC-H17 — Verificar que los logs clave aparecen en Console

Ejecutar los tests anteriores y verificar que estos logs aparecen en la pestaña Console de DevTools:

| Escenario | Qué buscar en Console (filtro) | Nivel |
|-----------|-------------------------------|-------|
| Sync inicia | `Iniciando sincronización de cola FIFO` | INFO |
| Optimización ejecuta | `Cola optimizada` | INFO |
| CREATE+DELETE cancelados | `CREATE+DELETE cancelados` | INFO |
| UPDATE reducido | `múltiples UPDATE reducidos a uno` | INFO |
| TempId reconciliado | `TempId reconciliado con servidor` | INFO |
| Merge ejecuta | `Merge completado` | DEBUG |
| Stuck recovery | `Recuperados` + `atascados en syncing` | WARN |
| Retry limit | `promovido a fallo permanente` | WARN |

> **Tip para producción:** Los logs DEBUG no se imprimen en la consola en producción. Para verlos, abrir Console y escribir: `getLogBuffer()` + Enter. Muestra las últimas 200 entradas con timestamp, nivel, módulo y mensaje.

---

## Criterios de aceptación global (hardening)

- [ ] **TC-H01**: CREATE offline → sync → **sin fila duplicada** en tabla
- [ ] **TC-H03**: Múltiples CREATEs → cada uno reconciliado individualmente
- [ ] **TC-H04**: UPDATE+UPDATE → solo **1 PUT** al servidor
- [ ] **TC-H05**: UPDATE+DELETE → solo **1 DELETE** al servidor
- [ ] **TC-H06**: CREATE duplicado (mismo payload) → solo **1 POST** al servidor
- [ ] **TC-H07**: DELETE pendiente → registro **no reaparece** tras refetch
- [ ] **TC-H08**: UPDATE pendiente → cambios locales **no se pierden** tras refetch
- [ ] **TC-H09**: CREATE local → fila **no desaparece** tras refetch
- [ ] **TC-H11**: Fallo permanente **no bloquea** el resto de la cola
- [ ] **TC-H14**: Cerrar pestaña mid-sync → sin duplicados al reabrir
- [ ] **TC-H15**: Dos pestañas → sin duplicados (lock + BroadcastChannel)
- [ ] **TC-H17**: Logs clave presentes y legibles

---

## Resumen rápido de atajos Chrome

| Acción | Atajo |
|--------|-------|
| Abrir DevTools | `F12` o `Ctrl + Shift + I` |
| Ir a pestaña Console | `Ctrl + Shift + J` |
| Ir a pestaña Network | Dentro de DevTools, click en **Network** |
| Ir a pestaña Application | Dentro de DevTools, click en **Application** |
| Recargar página | `F5` o `Ctrl + R` |
| Recargar sin caché | `Ctrl + Shift + R` |
| Abrir nueva pestaña | `Ctrl + T` |
| Cerrar pestaña actual | `Ctrl + W` |
| Reabrir última pestaña | `Ctrl + Shift + T` |
| Limpiar Console | `Ctrl + L` (dentro de Console) |

---

## Referencia técnica

| Componente | Archivo |
|------------|---------|
| Queue Optimizer | `src/lib/ccasa/conductivityQueueOptimizer.ts` |
| Merge Strategy | `src/lib/ccasa/conductivityMerge.ts` |
| Sync Engine (reconciliación) | `src/lib/ccasa/conductivitySyncEngine.ts` |
| Recovery stuck syncing | `src/lib/ccasa/conductivityOfflineDb.ts` |
| Local Store (tempId handling) | `src/lib/ccasa/conductivityLocalStore.ts` |
| Panel (localObjectId fix) | `src/components/ccasa/ConductivityPanel.tsx` |
| Documento de arquitectura | `docs/HARDENING_PWA_ANTI_DUPLICADOS.md` |
