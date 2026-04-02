export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
      ? (() => {
          const hostname = window.location.hostname
          const protocol = window.location.protocol

          // Dominio de pruebas
          if (hostname === 'ccasa.hexvorn.cloud') {
            return `${protocol}//ccasa.hexvorn.cloud/api`
          }

          // IP directa
          if (hostname === '76.13.96.56') {
            return 'http://76.13.96.56/api'
          }

          // Local
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8082/api'
          }

          return `${protocol}//${hostname}/api`
        })()
      : 'http://localhost:8082/api'),

  IS_DEVELOPMENT: process.env.NODE_ENV === 'development'
}
