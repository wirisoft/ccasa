# PWA Offline Layer — Implementation Notes

## Architecture Overview

| File | Role |
|------|------|
| `src/lib/logger.ts` | Structured logger: colored dev output + 200-entry production buffer |
| `src/types/conductivityOffline.ts` | Single source of truth for all offline types (OutboxRecord, QueueStats, etc.) |
| `src/lib/ccasa/conductivityOfflineDb.ts` | IndexedDB v2 layer — FIFO queue + logbook cache (`idb` library) |
| `src/lib/ccasa/conductivitySyncEngine.ts` | FIFO sync processor — one record at a time, retry policy, module-level lock |
| `src/hooks/useConnectivity.ts` | Tracks online/offline transitions via window events |
| `src/hooks/useConductivityQueue.ts` | React hook: stats, auto-sync on reconnect, BroadcastChannel, Background Sync |
| `src/components/ccasa/ConductivityPanel.tsx` | Panel UI — integrated offline status bar, cache fallback for logbooks |
| `public/sw.js` | Service worker v5 — CacheFirst/StaleWhileRevalidate/NetworkFirst strategies |
| `src/app/offline/page.tsx` | Offline fallback page shown when navigation fails |
| `src/components/ccasa/ServiceWorkerRegistrar.tsx` | Client island that registers the SW (production only) |

---

## Offline CRUD Flow

```
User action (form submit)
        │
        ├─ isOnline? NO ──────────────────────────► enqueue(CREATE/UPDATE/DELETE)
        │                                                    │
        │                                            IndexedDB outbox (v2)
        │                                            status: 'pending'
        │
        ├─ isOnline? YES
        │       │
        │       ▼
        │   apiFetch(POST /api/v1/conductivity-records)
        │       │
        │   success (2xx) ──────────────────────────► UI success toast
        │       │
        │   network error (TypeError) ──────────────► enqueue() → offline toast
        │       │
        │   business error (4xx/5xx) ───────────────► UI error toast (no queue)
        │
        └─ on reconnect (window 'online' event, debounced 1.5s)
                │
                ▼
          syncQueue() [FIFO, one record at a time]
                │
          ┌─────┴──────┐
          │             │
         2xx          4xx → failed_permanent (no retry)
          │             │
        done         5xx/TypeError → failed_retryable
                                    (retry up to maxRetries=5)
```

---

## Sync Engine Retry Policy

| HTTP Status | Outcome | Retried? |
|-------------|---------|----------|
| 2xx | `done` | — |
| 4xx | `failed_permanent` | Never |
| 5xx | `failed_retryable` | Up to `maxRetries` (default: 5) |
| TypeError (network) | `failed_retryable` | Up to `maxRetries` |
| `retryCount >= maxRetries` | promotes to `failed_permanent` | Never |

---

## How to Test Offline Behavior (Chrome DevTools)

1. Open Chrome DevTools → **Application** → **Service Workers** → verify SW is registered.
2. In **Network** tab → set throttle to **Offline**.
3. Open the Conductivity panel — you should see the "Sin conexión" chip (red).
4. Create a new record → it should save silently with "Guardado en cola local" toast.
5. Check **Application → IndexedDB → ccasa_conductivity_offline_v2 → conductivity_outbox** — the record should appear with `status: "pending"`.
6. Set throttle back to **No throttle** — the chip should turn green, auto-sync fires in ~1.5s.
7. The record disappears from IndexedDB (marked `done`) and appears in the table.
8. To inspect the sync log: DevTools Console (dev mode) shows `[INFO] [conductivitySyncEngine]` entries.
9. To export the queue as SQL: click "Exportar cola (.sql)" in the info banner.

---

## Queue Optimization (anti-duplicados)

Before processing the outbox, the sync engine runs `optimizeQueue()` (`conductivityQueueOptimizer.ts`) which collapses redundant operations on the same resource:

| Input | Output |
|-------|--------|
| CREATE + DELETE | Both removed (cancel out) |
| CREATE + UPDATE | Merged into a single CREATE with latest payload |
| UPDATE + UPDATE | Keep last UPDATE only |
| UPDATE + DELETE | Keep DELETE only |
| Duplicate CREATEs (same endpoint + payload) | Keep oldest |

Grouping key: `resource-${serverId}` for server records, `tempId` for local creates.

---

## TempId → ServerId Reconciliation

When a CREATE succeeds (HTTP 2xx), the sync engine:

1. Reads the response body to extract the server-assigned `conductivityId`.
2. Calls `confirmLocalRecord(tempId, serverRecord)` to replace the optimistic row in the local store.
3. Calls `updateQueueResourceId(localObjectId, serverId, endpoint)` to fix any pending operations referencing the same local object.

This prevents the UI from showing duplicate rows (optimistic + server-confirmed) after sync.

---

## Merge Strategy (anti data-loss)

`mergeServerWithLocal()` (`conductivityMerge.ts`) runs on every `fetchRecords()`:

- Server records with a pending DELETE → **excluded** from the result.
- Server records with a pending UPDATE → **local changes applied** over server data.
- Local CREATE records (isLocal=true) → **preserved** as-is.

This replaces the old direct `setRecords(serverData)` which could overwrite pending local changes.

---

## Stuck Syncing Recovery

`recoverStuckSyncing()` runs at the start of every `syncQueue()` call. Records left in `syncing` status for more than 60 seconds (e.g. app crash mid-sync) are reset to `pending`.

---

## Known Limitations

- **Full CRUD offline** — CREATE, UPDATE, and DELETE are all supported offline with optimistic UI and enqueue.
- **Background Sync API** (`SyncManager`) is only available in Chromium-based browsers; Safari and Firefox silently skip background sync registration.
- **Service worker** only registers in `production` mode (see `ServiceWorkerRegistrar.tsx`). In development, offline behaviour relies on `navigator.onLine` detection in the app code only.
- **IndexedDB v1 data** (from the old `ccasa_conductivity_offline_v1` database) is not migrated. Any records pending in v1 before this deployment will remain in the old DB until the user clears site data. They can be recovered manually via the v1 export SQL button.
- **Single Snackbar** — the notification system shows one message at a time; rapid successive events overwrite each other.
- **Server-side idempotency** — the sync engine sends `X-Correlation-Id` on every request. For full idempotency, the backend should validate this header and avoid re-processing duplicate requests.

---

## Suggested Next Steps

1. **Server-side idempotency** — validate `X-Correlation-Id` in the backend to reject duplicate POST requests.
2. **Extend to other modules** — apply the same `enqueue()` + `useConductivityQueue` pattern to DistilledWaterPanel and other panels that write data.
3. **Precache shell** — add the offline page and critical JS chunks to the SW install cache so the app loads instantly on repeat visits.
4. **Push notifications** — use the Push API to notify users on other devices when the queue syncs.
5. **Periodic Background Sync** — register `periodicSync` for browsers that support it, to sync even when the app is closed.
