/**
 * Service Worker — ccasa-frontend v5
 *
 * Cache strategies by request type:
 *   Static assets (_next/static, images, fonts) → CacheFirst  (ccasa-static-v1)
 *   GET /api/v1/logbooks                         → StaleWhileRevalidate (ccasa-api-v1)
 *   GET /api/v1/conductivity-records*            → NetworkFirst 3s timeout (ccasa-api-v1)
 *   POST/PUT/PATCH/DELETE /api/* while offline   → Synthetic 202 response
 *   Navigation (HTML)                            → NetworkFirst, cache fallback
 *   X-Sync-Engine: 1 requests                   → Bypass SW interception entirely
 *
 * Bump CACHE_VERSION when cache-busting is required.
 */

const CACHE_VERSION = 'ccasa-lab-v5'
const STATIC_CACHE = 'ccasa-static-v1'
const API_CACHE = 'ccasa-api-v1'

const ALL_CACHES = [CACHE_VERSION, STATIC_CACHE, API_CACHE]

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sin conexión — BSA Lab</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center;
           justify-content: center; height: 100vh; margin: 0;
           background: #f5f5f5; color: #333; text-align: center; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #666; max-width: 400px; margin: 0 auto 1rem; }
    a { color: #1565C0; }
  </style>
</head>
<body>
  <div>
    <h1>Sin conexión</h1>
    <p>Tus cambios se guardan localmente y se enviarán al reconectar.</p>
    <p><a href="/">Volver al inicio</a></p>
  </div>
</body>
</html>`

// ── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.info('[SW ccasa] Instalando v5')
  event.waitUntil(self.skipWaiting())
})

// ── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(names =>
        Promise.all(
          names
            .filter(name => !ALL_CACHES.includes(name))
            .map(name => {
              console.info('[SW ccasa] Eliminando caché obsoleta:', name)
              return caches.delete(name)
            })
        )
      )
      .then(() => self.clients.claim())
      .then(() => console.info('[SW ccasa] Activado — clientes controlados'))
  )
})

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // ── Bypass: sync engine requests skip all SW interception ───────────────
  if (request.headers.get('X-Sync-Engine') === '1') {
    return // let the browser handle directly; TypeError on offline = correct behavior
  }

  // ── Static assets: CacheFirst ────────────────────────────────────────────
  if (
    url.pathname.startsWith('/_next/static/') ||
    /\.(png|ico|svg|woff2|woff|ttf|jpg|jpeg|webp|gif|css)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // ── Logbooks API: StaleWhileRevalidate ───────────────────────────────────
  if (request.method === 'GET' && url.pathname.startsWith('/api/v1/logbooks')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        const networkPromise = fetch(request)
          .then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => /** network failed, return undefined */ undefined)

        return cache.match(request).then(cached => {
          // Kick off background revalidation
          event.waitUntil(networkPromise.catch(() => {}))
          // Serve stale immediately, fall back to live network if no cache
          return cached || fetch(request)
        })
      })
    )
    return
  }

  // ── Conductivity records API: NetworkFirst 3s timeout ───────────────────
  if (request.method === 'GET' && url.pathname.startsWith('/api/v1/conductivity-records')) {
    event.respondWith(
      new Promise(resolve => {
        let settled = false
        const settle = response => {
          if (!settled) {
            settled = true
            resolve(response)
          }
        }

        // 3-second network timeout
        const timeout = setTimeout(() => {
          caches.open(API_CACHE).then(cache =>
            cache.match(request).then(cached =>
              settle(
                cached ||
                  new Response(JSON.stringify({ error: 'Sin conexión al servidor' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                  })
              )
            )
          )
        }, 3000)

        fetch(request)
          .then(response => {
            clearTimeout(timeout)
            if (response.ok) {
              caches.open(API_CACHE).then(cache => cache.put(request, response.clone()))
            }
            settle(response)
          })
          .catch(() => {
            clearTimeout(timeout)
            caches.open(API_CACHE).then(cache =>
              cache.match(request).then(cached =>
                settle(
                  cached ||
                    new Response(JSON.stringify({ error: 'Sin conexión al servidor' }), {
                      status: 503,
                      headers: { 'Content-Type': 'application/json' },
                    })
                )
              )
            )
          })
      })
    )
    return
  }

  // ── Offline mutations: synthetic 202 when network fails ──────────────────
  // Applies to POST/PUT/PATCH/DELETE to /api/* (but NOT X-Sync-Engine requests, handled above)
  if (
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        console.warn('[SW ccasa] Mutación sin conexión interceptada:', request.url)
        return new Response(JSON.stringify({ queued: true, offline: true }), {
          status: 202,
          headers: {
            'Content-Type': 'application/json',
            'X-Offline-Queue': 'true',
          },
        })
      })
    )
    return
  }

  // ── Other API routes: skip SW (no caching) ───────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // ── Navigation / general requests: NetworkFirst, cache fallback ──────────
  const isNavigation = request.mode === 'navigate'
  const networkRequest = isNavigation ? new Request(request, { cache: 'no-store' }) : request

  event.respondWith(
    fetch(networkRequest)
      .then(response => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(request, clone)
          })
        }
        return response
      })
      .catch(() =>
        caches.match(request).then(
          cached =>
            cached ||
            new Response(OFFLINE_HTML, {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
        )
      )
  )
})

// ── BACKGROUND SYNC ──────────────────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'ccasa-conductivity-sync') {
    console.info('[SW ccasa] Background sync disparado:', event.tag)
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients =>
        clients.forEach(client =>
          client.postMessage({ type: 'TRIGGER_SYNC', tag: event.tag })
        )
      )
    )
  }
})

// ── MESSAGE ──────────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.info('[SW ccasa] SKIP_WAITING solicitado')
    self.skipWaiting()
  }
})
