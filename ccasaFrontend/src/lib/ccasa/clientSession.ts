const STORAGE_ACCESS_TOKEN_KEY = 'ccasa_access_token'
const STORAGE_EMAIL_KEY = 'ccasa_user_email'
const STORAGE_ROLE_KEY = 'ccasa_user_role'
const STORAGE_USER_ID_KEY = 'ccasa_user_id'
const STORAGE_FIRST_NAME_KEY = 'ccasa_user_firstName'
const STORAGE_LAST_NAME_KEY = 'ccasa_user_lastName'

const ALL_SESSION_KEYS = [
  STORAGE_ACCESS_TOKEN_KEY,
  STORAGE_EMAIL_KEY,
  STORAGE_ROLE_KEY,
  STORAGE_USER_ID_KEY,
  STORAGE_FIRST_NAME_KEY,
  STORAGE_LAST_NAME_KEY
] as const

export type StoredProfile = {
  email: string | null
  role: string | null
  userId: number | null
  firstName: string | null
  lastName: string | null
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY)
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === 'undefined') {
    return
  }

  if (token) {
    window.localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY)
  }
}

export function readStoredProfile(): StoredProfile {
  if (typeof window === 'undefined') {
    return { email: null, role: null, userId: null, firstName: null, lastName: null }
  }

  const rawId = window.localStorage.getItem(STORAGE_USER_ID_KEY)
  const parsedId = rawId != null && rawId !== '' ? Number(rawId) : NaN

  return {
    email: window.localStorage.getItem(STORAGE_EMAIL_KEY),
    role: window.localStorage.getItem(STORAGE_ROLE_KEY),
    userId: Number.isFinite(parsedId) ? parsedId : null,
    firstName: window.localStorage.getItem(STORAGE_FIRST_NAME_KEY),
    lastName: window.localStorage.getItem(STORAGE_LAST_NAME_KEY)
  }
}

export function writeStoredProfile(
  email: string | null,
  role: string | null,
  userId: number | null,
  firstName: string | null,
  lastName: string | null
): void {
  if (typeof window === 'undefined') {
    return
  }

  if (email) {
    window.localStorage.setItem(STORAGE_EMAIL_KEY, email)
  } else {
    window.localStorage.removeItem(STORAGE_EMAIL_KEY)
  }

  if (role) {
    window.localStorage.setItem(STORAGE_ROLE_KEY, role)
  } else {
    window.localStorage.removeItem(STORAGE_ROLE_KEY)
  }

  if (userId != null && !Number.isNaN(userId)) {
    window.localStorage.setItem(STORAGE_USER_ID_KEY, String(userId))
  } else {
    window.localStorage.removeItem(STORAGE_USER_ID_KEY)
  }

  if (firstName) {
    window.localStorage.setItem(STORAGE_FIRST_NAME_KEY, firstName)
  } else {
    window.localStorage.removeItem(STORAGE_FIRST_NAME_KEY)
  }

  if (lastName) {
    window.localStorage.setItem(STORAGE_LAST_NAME_KEY, lastName)
  } else {
    window.localStorage.removeItem(STORAGE_LAST_NAME_KEY)
  }
}

/** Elimina token y perfil de localStorage (sesión cliente). */
export function clearCcasaClientSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  for (const key of ALL_SESSION_KEYS) {
    window.localStorage.removeItem(key)
  }
}
