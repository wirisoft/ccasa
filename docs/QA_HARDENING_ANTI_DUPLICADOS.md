# QA — Hardening anti-duplicados PWA conductividad

Plan de pruebas para validar que el sistema offline **no genera duplicados**, **no pierde datos pendientes** y **optimiza correctamente la cola** antes de sincronizar.

> Este plan complementa a `QA_CONDUCTIVIDAD_OFFLINE_PWA.md` (flujo básico offline). Aquí se cubren los escenarios de **idempotencia, reconciliación y consistencia** agregados en el hardening.

---

## Prerrequisitos

1. Frontend en **modo producción** (`npm run build && npm run start`) o en `next dev` para pruebas rápidas (sin service worker pero con cola funcional).
2. Usuario autenticado con permisos de conductividad y al menos **una bitácora activa**.
3. **Chrome DevTools** abierto:
   - **Application → IndexedDB → `ccasa_conductivity_offline_v2` → `conductivity_outbox`** (para inspeccionar la cola).
   - **Network** (para toggle Offline).
   - **Console** (para ver logs del sistema: `[INFO] [conductivitySyncEngine]`, `[INFO] [conductivityQueueOptimizer]`, etc.).
4. Al menos **un registro de conductividad existente** en el servidor (creado con red) para los tests de UPDATE y DELETE.

---

## A. RECONCILIACIÓN TEMPID → SERVERID (sin duplicados en UI)

### TC-H01 — CREATE offline: no debe haber fila duplicada tras sync

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red, anotar cuántos registros hay en la tabla. | Ej: 5 registros. |
| 2 | Activar **Offline** en DevTools → Network. | Chip cambia a **Sin conexión** (rojo). |
| 3 | Pulsar **Nuevo registro**, completar tipo=Alta, peso=0.7456, bitácora, y **Guardar**. | Diálogo se cierra. Toast: "Guardado en cola local". Tabla muestra **6 registros** (el nuevo tiene chip **Local** y opacidad reducida). |
| 4 | En IndexedDB → `conductivity_outbox`: verificar que hay 1 registro con `operationType: "CREATE"`, `status: "pending"`. | El campo `localObjectId` debe empezar con `temp-` (ej: `temp-1713225600000-a3f2k`). |
| 5 | Desactivar Offline → restaurar red. | Chip cambia a **En línea** (verde). Auto-sync inicia en ~1.5s. |
| 6 | Esperar a que el chip deje de pulsar (sync terminó). Verificar la tabla. | **6 registros totales** (NO 7). La fila que antes decía "Local" ahora tiene datos reales del servidor (folio, conductor calculado, etc.). |
| 7 | En Console: buscar log `TempId reconciliado con servidor`. | Debe existir con el `localObjectId` y `serverId` correcto. |
| 8 | En IndexedDB → `conductivity_outbox`: verificar que el registro ahora tiene `status: "done"`. | No debe quedar en `pending`. |

**Criterio de fallo:** Si la tabla muestra 7 registros (duplicado: fila local + fila servidor), el test FALLA.

---

### TC-H02 — CREATE offline con fallo de red "online" (fallback a cola)

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red real, **apagar el backend** (o bloquear el puerto del API) pero mantener WiFi activo. | El navegador sigue reportando `navigator.onLine = true`. |
| 2 | Crear un registro. | El POST falla con TypeError (network error). El sistema detecta error de red y encola. Toast: "Guardado en cola local". |
| 3 | Verificar IndexedDB: `conductivity_outbox` tiene 1 registro `pending`. | `localObjectId` empieza con `temp-`. |
| 4 | Encender el backend de nuevo. Pulsar **Sincronizar ahora**. | Sync exitoso. Tabla muestra el registro **sin duplicar**. |

---

### TC-H03 — Múltiples CREATEs offline: cada uno reconciliado individualmente

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline. | Chip rojo. |
| 2 | Crear **3 registros distintos** (variar peso: 0.7400, 0.7500, 0.7600). | Tabla muestra 3 filas locales. Cola = 3. |
| 3 | En IndexedDB: verificar 3 registros `pending`, cada uno con `localObjectId` distinto. | Los `tempId` son únicos. |
| 4 | Restaurar red. Esperar auto-sync. | Los 3 se sincronizan FIFO. |
| 5 | Verificar tabla. | **Exactamente 3 registros nuevos** (no 6). Cada uno con datos reales del servidor. Ninguna fila con chip "Local". |
| 6 | Console: buscar 3 logs `TempId reconciliado con servidor`. | Cada uno con un `serverId` distinto. |

---

## B. OPTIMIZACIÓN DE COLA (deduplicación)

### TC-H04 — UPDATE + UPDATE mismo registro: solo se envía el último

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red, verificar que existe un registro Draft (ej: id=42, peso=0.7400). | Registro visible en tabla. |
| 2 | Ir Offline. | Chip rojo. |
| 3 | Editar el registro: cambiar peso a **0.7500**. Guardar. | Toast: "Actualización guardada en cola local". |
| 4 | Editar el **mismo registro** de nuevo: cambiar peso a **0.7600**. Guardar. | Toast: "Actualización guardada en cola local". Cola = 2. |
| 5 | En IndexedDB: verificar 2 registros `pending` de tipo `UPDATE`, ambos con `localObjectId: "resource-42"`. | Ambos comparten el mismo `localObjectId`. |
| 6 | Restaurar red. Esperar sync o pulsar **Sincronizar ahora**. | Console: `múltiples UPDATE reducidos a uno`. **Solo 1 PUT** enviado al servidor. |
| 7 | Verificar tabla: el registro muestra peso **0.7600** (el último valor). | El valor intermedio (0.7500) nunca llegó al servidor. |

**Criterio de fallo:** Si la Console muestra 2 llamadas PUT al API, la optimización no funcionó.

---

### TC-H05 — UPDATE + DELETE mismo registro: solo se envía DELETE

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red, verificar un registro Draft existente (ej: id=50). | Visible en tabla. |
| 2 | Ir Offline. | Chip rojo. |
| 3 | Editar el registro (cambiar peso). Guardar. | Cola = 1 (UPDATE). |
| 4 | Eliminar el **mismo registro**. Confirmar. | Cola = 2 (UPDATE + DELETE). Registro desaparece de la tabla. |
| 5 | En IndexedDB: 2 registros, ambos con `localObjectId: "resource-50"`. | 1 UPDATE + 1 DELETE. |
| 6 | Restaurar red. Sync. | Console: `UPDATE(s)+DELETE reducidos a DELETE`. **Solo 1 DELETE** enviado. |
| 7 | Verificar tabla: registro eliminado del servidor. | No reaparece. |

---

### TC-H06 — CREATE duplicado (doble-click): solo se envía uno

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline. | Chip rojo. |
| 2 | Crear un registro con datos exactamente iguales **dos veces** (mismo tipo, mismo peso, misma bitácora). | Cola muestra 2. Tabla muestra 2 filas locales. |
| 3 | En IndexedDB: 2 CREATEs con `endpoint` y `payload` idénticos. | `localObjectId` distinto (son dos enqueue separados), pero payload igual. |
| 4 | Restaurar red. Sync. | Console: `CREATE duplicado eliminado`. **Solo 1 POST** enviado. |
| 5 | Verificar tabla: **1 registro** nuevo, no 2. | Solo aparece una fila real. |

---

## C. MERGE STRATEGY (protección de datos locales)

### TC-H07 — Registro con DELETE pendiente no reaparece tras refetch

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red, verificar que existe un registro Draft (ej: id=60). Anotar cantidad total. | Ej: 8 registros. |
| 2 | Ir Offline. | Chip rojo. |
| 3 | Eliminar el registro id=60. | Tabla: 7 registros. Cola = 1 (DELETE). |
| 4 | Restaurar red **brevemente** pero **NO esperar** a que el sync termine (o desactivar sync manual). | `fetchRecords()` se ejecuta (trae datos del servidor). |
| 5 | Verificar tabla: el registro id=60 **NO debe reaparecer**. | Sigue sin mostrarse. La merge strategy lo excluye porque hay un DELETE pendiente. |
| 6 | Esperar sync completo. | DELETE se ejecuta. Registro eliminado del servidor definitivamente. |

**Criterio de fallo:** Si al restaurar red el registro vuelve a la tabla momentáneamente, la merge strategy no funciona.

---

### TC-H08 — Registro con UPDATE pendiente mantiene cambios locales tras refetch

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red, verificar un registro Draft (ej: id=70, peso=0.7400). | Visible en tabla. |
| 2 | Ir Offline. | Chip rojo. |
| 3 | Editar el registro: cambiar peso a **0.9999**. Guardar. | Tabla muestra peso 0.9999. Cola = 1 (UPDATE). |
| 4 | Restaurar red. El `fetchRecords` trae datos del servidor (peso original 0.7400). | La merge strategy aplica el UPDATE local sobre los datos del servidor. |
| 5 | Verificar tabla: el registro muestra peso **0.9999** (no 0.7400). | El cambio local no se perdió. |
| 6 | Esperar sync completo. | PUT se ejecuta. Servidor actualizado a 0.9999. |

---

### TC-H09 — CREATE local se preserva tras refetch

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline. Crear un registro (tipo=Baja, peso=0.5000). | Tabla muestra fila local. Cola = 1. |
| 2 | Restaurar red **brevemente** (fetchRecords se dispara). | `mergeServerWithLocal` ejecuta. |
| 3 | Verificar tabla: la fila local (chip "Local") **sigue visible**. | No desapareció con el refetch. |
| 4 | Esperar sync. | CREATE se ejecuta. Fila local se reemplaza por fila real. |

---

## D. RECUPERACIÓN DE REGISTROS ATASCADOS

### TC-H10 — Registro en syncing se recupera tras restart

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline. Crear un registro. Cola = 1. | Registro `pending` en IndexedDB. |
| 2 | En IndexedDB: **manualmente** editar el registro y cambiar `status` a `"syncing"` y `updatedAt` a un valor de hace 2 minutos (`Date.now() - 120000`). | Simula un crash mid-sync. |
| 3 | Restaurar red. Pulsar **Sincronizar ahora**. | Console: `Recuperados 1 registro(s) atascados en syncing`. |
| 4 | El registro se procesa normalmente. | Sync exitoso. Registro en servidor. |

**Nota:** Este paso requiere edición manual de IndexedDB, es un test de resiliencia.

---

## E. RETRY Y CONTROL DE FALLOS

### TC-H11 — Fallo permanente no bloquea la cola

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline. Crear **2 registros** (A y B). Cola = 2. | Ambos `pending`. |
| 2 | En IndexedDB: editar el registro A → cambiar `endpoint` a una URL inválida (ej: `/api/v1/conductivity-records-INVALID`). | Esto forzará un 404 al sincronizar A. |
| 3 | Restaurar red. Sync. | A falla con 404 → `failed_permanent`. B se envía correctamente → `done`. |
| 4 | Verificar: sección **Errores de sincronización** muestra A. B aparece en la tabla como registro real. | A no bloqueó a B. |

---

### TC-H12 — Reintentar operación fallida

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Tras TC-H11, hay un registro `failed_permanent` en errores de sincronización. | Visible con botones **Reintentar** y **Eliminar**. |
| 2 | Corregir la URL en IndexedDB (volver a `/api/v1/conductivity-records`). | Preparación para retry. |
| 3 | Pulsar **Reintentar**. | Console: `Registro reseteado para reintento`. Se dispara sync. |
| 4 | Verificar: registro se sincroniza exitosamente. Desaparece de errores. | Status en IndexedDB: `done`. |

---

### TC-H13 — Eliminar operación fallida

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Tener un registro `failed_permanent` en la sección de errores. | Visible. |
| 2 | Pulsar **Eliminar**. | La operación desaparece de la sección de errores. |
| 3 | Verificar IndexedDB: el registro fue eliminado del outbox. | No queda rastro. |

---

## F. IDEMPOTENCIA EN ESCENARIOS EDGE

### TC-H14 — Cerrar pestaña durante sync y reabrir

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline. Crear un registro. Cola = 1. | `pending`. |
| 2 | Restaurar red. Inmediatamente **cerrar la pestaña** antes de que el sync termine. | El sync se interrumpe. |
| 3 | Reabrir la pestaña de conductividad. | El registro puede estar en `syncing` (atascado) o `pending`. |
| 4 | Esperar sync automático o pulsar **Sincronizar ahora**. | Si estaba en `syncing`, `recoverStuckSyncing` lo resetea a `pending`. Se procesa normalmente. |
| 5 | Verificar: **solo 1 registro** creado en el servidor. | No hay duplicado. |

---

### TC-H15 — Sync en dos pestañas simultáneas

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline en pestaña A. Crear un registro. Cola = 1. | `pending`. |
| 2 | Abrir **pestaña B** con la misma vista de conductividad. | Pestaña B carga la tabla. |
| 3 | Restaurar red. Ambas pestañas detectan `online`. | Solo UNA pestaña ejecuta el sync (lock `isSyncing`). La otra recibe `skipped`. |
| 4 | Verificar en ambas pestañas: la tabla muestra el registro sin duplicar. | BroadcastChannel sincroniza el estado entre tabs. |
| 5 | Verificar en servidor: **solo 1 registro** creado. | El lock a nivel módulo previene doble ejecución. |

---

### TC-H16 — Red intermitente durante sync

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Ir Offline. Crear **3 registros**. Cola = 3. | 3 `pending`. |
| 2 | Restaurar red. Cuando el sync procesa el 2do registro, cortar red de nuevo (toggle Offline rápido). | Registro 1: `done`. Registro 2: puede ser `failed_retryable` o `syncing`. Registro 3: `pending`. |
| 3 | Restaurar red de nuevo. Auto-sync tras 1.5s. | Registros 2 y 3 se procesan. Si 2 estaba `syncing` + viejo → `recoverStuckSyncing` lo rescata. |
| 4 | Verificar tabla: **exactamente 3 registros** nuevos en el servidor. | Ningún duplicado, ninguno perdido. |

---

## G. LOGS Y OBSERVABILIDAD

### TC-H17 — Verificar que los logs clave aparecen en Console

| Escenario | Log esperado en Console | Nivel |
|-----------|------------------------|-------|
| Sync inicia | `Iniciando sincronización de cola FIFO` | INFO |
| Optimización ejecuta | `Cola optimizada { before: N, after: M, dropped: X }` | INFO |
| CREATE+DELETE cancelados | `Optimización: CREATE+DELETE cancelados` | INFO |
| UPDATE reducido | `Optimización: múltiples UPDATE reducidos a uno` | INFO |
| TempId reconciliado | `TempId reconciliado con servidor { localObjectId, serverId }` | INFO |
| Merge ejecuta | `Merge completado { server, localPending, pendingDeletes, pendingUpdates, result }` | DEBUG |
| Stuck recovery | `Recuperados N registro(s) atascados en syncing` | WARN |
| Retry limit | `Registro promovido a fallo permanente (máx reintentos alcanzados)` | WARN |

Para ver logs DEBUG en producción: los logs se almacenan en buffer interno. Usar `getLogBuffer()` desde Console.

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

## Herramientas de depuración

| Herramienta | Cómo usarla |
|-------------|-------------|
| IndexedDB inspector | DevTools → Application → IndexedDB → `ccasa_conductivity_offline_v2` |
| Logs en producción | Console: `getLogBuffer()` (últimas 200 entradas) |
| Exportar cola | Botón **Exportar cola (.sql)** en el banner de pendientes |
| Network tab | Verificar cuántos POST/PUT/DELETE reales se enviaron al servidor |
| Console filter | Filtrar por `[conductivitySyncEngine]`, `[conductivityQueueOptimizer]`, `[conductivityMerge]` |

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
