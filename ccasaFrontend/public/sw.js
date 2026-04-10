/** Subir versión en cada despliegue relevante del shell HTML / rutas pre-cacheadas. */
const CACHE_NAME = 'ccasa-lab-v2'

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
    p { color: #666; }
  </style>
</head>
<body>
  <div>
    <h1>Sin conexión 📡</h1>
    <p>No hay conexión a internet. Verifica tu red e intenta nuevamente.</p>
  </div>
</body>
</html>`

// Rutas alineadas con slugs reales bajo /entradas/[slug] y páginas principales
const STATIC_ASSETS = [
  '/',
  '/bitacoras',
  '/entradas/core',
  '/entradas/agua-destilada',
  '/entradas/conductividad',
  '/entradas/temperatura-horno',
  '/entradas/horno-secado',
  '/entradas/gastos-cartas',
  '/entradas/lavado-material',
  '/entradas/preparacion-soluciones',
  '/entradas/pesadas',
  '/entradas/precision',
  '/entradas/tratamiento-matraz',
  '/catalogos/reactivos',
  '/catalogos/lotes',
  '/catalogos/soluciones',
  '/catalogos/insumos',
  '/catalogos/frascos-reactivo',
  '/folios',
  '/alertas',
  '/firmas',
  '/empleados',
  '/roles',
  '/login',
  '/register',
  '/account-settings',
  '/_not-found'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache =>
        Promise.all(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(() => {
              /* Ignorar fallos (redirect, 401, etc.) para no bloquear install */
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(names =>
        Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Navegación HTML: evitar respuesta obsoleta por caché HTTP del documento (títulos, RSC, etc.).
  const isNavigation = request.mode === 'navigate'
  const networkRequest = isNavigation ? new Request(request, { cache: 'no-store' }) : request

  event.respondWith(
    fetch(networkRequest)
      .then(response => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
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
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            })
        )
      )
  )
})
