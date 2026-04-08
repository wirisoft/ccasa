const DEFAULT_INTERNAL_PATH = '/'

/**
 * Convierte el query `next` en una ruta interna segura (misma app).
 * Rechaza open redirects (//, esquemas, @, etc.).
 */
export function safeInternalPath(raw: string | null | undefined): string {
  if (raw == null) {
    return DEFAULT_INTERNAL_PATH
  }

  let s = raw.trim()

  if (s === '') {
    return DEFAULT_INTERNAL_PATH
  }

  try {
    s = decodeURIComponent(s)
  } catch {
    return DEFAULT_INTERNAL_PATH
  }

  s = s.trim()

  if (s === '' || !s.startsWith('/') || s.startsWith('//')) {
    return DEFAULT_INTERNAL_PATH
  }

  // javascript:, data:, etc. si llegaran como path absoluto raro
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(s)) {
    return DEFAULT_INTERNAL_PATH
  }

  if (s.includes('@') || /[\r\n\0]/.test(s)) {
    return DEFAULT_INTERNAL_PATH
  }

  return s
}
