import { clearCcasaClientSession, getStoredAccessToken } from '@/lib/ccasa/clientSession'

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8082'

  return raw.replace(/\/$/, '')
}

export { getStoredAccessToken }

export function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Solicitud inválida. Verifica los datos ingresados.',
    401: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso solicitado no fue encontrado.',
    409: 'Ya existe un registro con esos datos.',
    422: 'Los datos enviados no son válidos.',
    500: 'Error interno del servidor. Intenta nuevamente.',
    503: 'El servicio no está disponible en este momento.'
  }

  return messages[status] ?? `Error inesperado (código ${status}).`
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string }

    return data.message || data.error || getHttpErrorMessage(res.status)
  } catch {
    return getHttpErrorMessage(res.status)
  }
}

export type ApiFetchOptions = RequestInit & {

  /** Si no se pasa, se usa el token guardado (solo cliente) */
  token?: string | null

  /** true = no enviar Authorization */
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, skipAuth, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  const body = rest.body

  if (body != null && typeof body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!skipAuth) {
    const authToken = token !== undefined ? token : getStoredAccessToken()

    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }
  }

  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, { ...rest, headers })

  if (!res.ok) {
    // Token expirado o inválido — limpiar sesión y redirigir
    if (res.status === 401 && !skipAuth) {
      if (typeof window !== 'undefined') {
        clearCcasaClientSession()
        window.location.href = '/login?expired=true'
      }

      throw new Error('Sesión expirada')
    }

    const msg = await parseErrorResponse(res)

    throw new Error(msg || getHttpErrorMessage(res.status))
  }

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()

  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export const PDF_DOWNLOAD_ERROR =
  'No se pudo descargar el PDF del registro. Comprueba la conexión e inténtalo de nuevo.'

export function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err

  return fallback
}
