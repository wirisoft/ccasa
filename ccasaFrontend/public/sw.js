const CACHE_NAME = 'ccasa-lab-v1'

// Rutas alineadas con slugs reales bajo /entradas/[slug]
const PRECACHE_URLS = [
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
  '/roles'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache =>
        Promise.all(
          PRECACHE_URLS.map(url =>
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

  event.respondWith(
    fetch(request)
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
            new Response('Sin conexión', {
              status: 503,
              statusText: 'Offline'
            })
        )
      )
  )
})
