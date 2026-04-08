const STORAGE_KEY = 'ccasa_access_token'

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  return raw.replace(/\/$/, '')
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null

  return window.localStorage.getItem(STORAGE_KEY)
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return

  if (token) {
    window.localStorage.setItem(STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string }

    return data.message || data.error || res.statusText
  } catch {
    return res.statusText
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
        window.localStorage.removeItem('ccasa_access_token')
        window.localStorage.removeItem('ccasa_user_email')
        window.localStorage.removeItem('ccasa_user_role')
        window.localStorage.removeItem('ccasa_user_id')
        window.localStorage.removeItem('ccasa_user_firstName')
        window.localStorage.removeItem('ccasa_user_lastName')
        window.location.href = '/login?expired=true'
      }

      throw new Error('Sesión expirada')
    }

    const msg = await parseErrorResponse(res)

    throw new Error(msg || `HTTP ${res.status}`)
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
