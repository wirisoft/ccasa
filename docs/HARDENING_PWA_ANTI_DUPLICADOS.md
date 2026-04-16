# Hardening PWA — Anti-duplicados y consistencia offline

Documento técnico que describe los cambios realizados para resolver el problema de **idempotencia y duplicados** en el módulo de conductividad offline.

---

## Problema

Cuando el usuario crea/edita/elimina registros sin conexión y la red regresa, el sistema anterior podía producir:

1. **Duplicados en UI:** la fila optimista (ID negativo, `isLocal: true`) permanecía en el store local incluso después de que el servidor confirmaba la creación — resultado: misma fila aparecía dos veces.
2. **Operaciones redundantes al servidor:** si el usuario hacía CREATE → UPDATE → DELETE offline sobre el mismo recurso, el sistema enviaba las 3 operaciones al servidor en vez de cancelarlas.
3. **Datos locales sobrescritos:** al hacer `fetchRecords()` después de un sync, las ediciones locales pendientes (UPDATE/DELETE encolados) se perdían al ser reemplazadas por la versión del servidor.

---

## Arquitectura ANTES vs DESPUÉS

### ANTES

```
enqueue(CREATE) ─────────────────────┐
enqueue(UPDATE) ─────────────────────┤  cada uno con localObjectId DISTINTO
enqueue(DELETE) ─────────────────────┘  (create-xxx, update-xxx, delete-xxx)
        │
        ▼
deduplicateQueue()  ← agrupa por localObjectId → nunca los junta
        │
        ▼
sync FIFO → POST + PUT + DELETE  (3 peticiones, debería ser 0)
        │
        ▼
fetchRecords() → setRecords(serverData)  ← BORRA pending locales
```

### DESPUÉS

```
enqueue(CREATE) ─────────────────────┐
enqueue(UPDATE) ─────────────────────┤  localObjectId ESTABLE por recurso
enqueue(DELETE) ─────────────────────┘  (tempId para CREATE, resource-N para server records)
        │
        ▼
optimizeQueue()  ← agrupa por recurso → CREATE+DELETE = cancelar ambos
        │
        ▼
sync FIFO → (0 peticiones en este caso)
        │
        ▼
fetchRecords() → mergeServerWithLocal()  ← PROTEGE pending locales
```

---

## Cambios implementados

### 1. Queue Optimizer (`conductivityQueueOptimizer.ts`) — NUEVO

Motor de optimización que reemplaza la deduplicación básica anterior. Reglas:

| Combinación | Resultado |
|-------------|-----------|
| CREATE + DELETE (mismo recurso) | **Cancelar ambos** — el registro nunca existió |
| CREATE + UPDATE (mismo recurso) | **Fusionar** payload del UPDATE en el CREATE |
| UPDATE + UPDATE (mismo recurso) | **Conservar solo el último** UPDATE |
| UPDATE + DELETE (mismo recurso) | **Conservar solo el DELETE** |
| CREATE duplicado (mismo endpoint + payload) | **Conservar el más antiguo** |

**Clave:** la agrupación usa `resourceId` para registros del servidor y `localObjectId` para registros locales.

### 2. Fix de `localObjectId` (ConductivityPanel.tsx)

**Antes:** cada operación generaba un ID distinto (`create-xxx`, `update-xxx`, `delete-xxx`), imposibilitando la agrupación.

**Después:**
- **CREATE:** `localObjectId = tempId` (ej: `temp-1713225600000-a3f2k`)
- **UPDATE/DELETE sobre registro del servidor:** `localObjectId = resource-${conductivityId}` (ej: `resource-42`)

Esto permite que el optimizer detecte y colapse operaciones redundantes sobre el mismo recurso.

### 3. Reconciliación tempId → serverId (conductivitySyncEngine.ts)

Cuando un CREATE tiene éxito (HTTP 2xx):

1. El sync engine **lee el body de la respuesta** del servidor (antes lo ignoraba).
2. Extrae el `conductivityId` real asignado por el servidor.
3. Llama a `confirmLocalRecord(tempId, serverRecord)` — **reemplaza** la fila optimista por la real en el store local.
4. Actualiza `resourceId` y `endpoint` en cualquier operación pendiente que referencie el mismo `localObjectId`.

**Resultado:** no más duplicados (fila optimista + fila real) en la UI después del sync.

### 4. Merge strategy segura (`conductivityMerge.ts`) — NUEVO

Función `mergeServerWithLocal()` que se ejecuta en cada `fetchRecords()`:

- Registros del servidor con **DELETE pendiente** en la cola → **excluidos** (no reaparecen).
- Registros del servidor con **UPDATE pendiente** en la cola → **se aplican los cambios locales** sobre los datos del servidor.
- Registros locales (`isLocal: true`, CREATEs no sincronizados) → **preservados**.

Reemplaza el `setRecords(serverData)` directo que antes perdía los pending.

### 5. Recuperación de registros atascados (`conductivityOfflineDb.ts`)

Nueva función `recoverStuckSyncing()`:
- Si la app se cierra/crashea durante un sync, los registros quedan en estado `syncing` para siempre.
- Al iniciar cada sync, se detectan registros en `syncing` con más de 60 segundos y se resetean a `pending`.

### 6. Función `updateQueueResourceId` (`conductivityOfflineDb.ts`)

Actualiza el `resourceId` y `endpoint` de operaciones pendientes tras la reconciliación de un CREATE. Preparación para cuando la UI permita editar/eliminar registros locales.

---

## Archivos modificados

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `src/types/conductivityOffline.ts` | Mod | Tipos `SyncAppliedChange`, `OptimizeResult` |
| `src/lib/ccasa/conductivityQueueOptimizer.ts` | **Nuevo** | Motor de optimización de cola |
| `src/lib/ccasa/conductivityMerge.ts` | **Nuevo** | Estrategia de merge seguro server ↔ local |
| `src/lib/ccasa/conductivityOfflineDb.ts` | Mod | `updateQueueResourceId()`, `recoverStuckSyncing()` |
| `src/lib/ccasa/conductivityLocalStore.ts` | Mod | `getLocalPendingRecords()`, `removeLocalByTempId()`, `setMergedStore()` |
| `src/lib/ccasa/conductivitySyncEngine.ts` | Mod | Usa optimizer, lee response del CREATE, reconciliación tempId |
| `src/components/ccasa/ConductivityPanel.tsx` | Mod | localObjectId estable, merge en fetchRecords, refactored CREATE handler |

---

## Cómo verificar que funciona

### Test 1 — CREATE offline sin duplicados

1. DevTools → Network → Offline
2. Crear un registro de conductividad
3. Verificar en IndexedDB: `conductivity_outbox` tiene 1 registro `pending`
4. Quitar modo Offline → esperar auto-sync (~1.5s)
5. **Verificar:** la tabla muestra 1 solo registro (no 2)
6. En IndexedDB: el outbox está en `done`

### Test 2 — CREATE + DELETE offline = cancelación

1. DevTools → Network → Offline
2. Crear un registro → cola = 1
3. Eliminar ese mismo registro → cola debería bajar
4. Restaurar red → **el sync no envía nada al servidor**
5. Verificar en Console: log dice "CREATE+DELETE cancelados"

### Test 3 — UPDATE + UPDATE offline = uno solo

1. Con red, crear un registro real en el servidor
2. Ir offline
3. Editar el registro (cambiar peso)
4. Editar el mismo registro de nuevo (cambiar peso otra vez)
5. Verificar IndexedDB: la cola puede tener 2 UPDATE
6. Restaurar red → **solo se envía 1 PUT** (el último)
7. Console: log dice "múltiples UPDATE reducidos a uno"

### Test 4 — Merge protege pending

1. Ir offline
2. Crear un registro (queda local)
3. Restaurar red brevemente (fetchRecords se dispara)
4. **Verificar:** el registro local no desaparece de la tabla
5. El sync envía el CREATE → fila real aparece, fila optimista se reemplaza

---

## Notas para backend

Para idempotencia completa del lado servidor, se recomienda:

- Validar el header `X-Correlation-Id` que ya envía el sync engine.
- Si el servidor detecta un `correlationId` ya procesado, devolver el registro existente en vez de crear uno nuevo.
- Esto protege contra el caso donde la respuesta del POST se pierde (timeout) y el retry reenvía el mismo body.

---

## Dependencias entre componentes

```
ConductivityPanel.tsx
  ├── conductivityMerge.ts (merge en fetchRecords)
  ├── conductivityLocalStore.ts (optimistic UI)
  ├── conductivityOfflineDb.ts (enqueue)
  └── useConductivityQueue.ts (hook de sync)
        └── conductivitySyncEngine.ts
              ├── conductivityQueueOptimizer.ts (optimización pre-sync)
              ├── conductivityOfflineDb.ts (estado de cola)
              └── conductivityLocalStore.ts (reconciliación tempId)
```

---

*Documento generado como parte del hardening PWA anti-duplicados — ccasa conductividad offline.*
