/**
 * Valores por defecto cuando no hay `.env` / variables NEXT_PUBLIC_* en build.
 * Deben coincidir con `ccasaFrontend/.env.example`.
 */
export const NEXT_PUBLIC_DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? ''

export const NEXT_PUBLIC_PRO_URL = process.env.NEXT_PUBLIC_PRO_URL ?? ''

export const NEXT_PUBLIC_REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME ?? 'ccasa'
