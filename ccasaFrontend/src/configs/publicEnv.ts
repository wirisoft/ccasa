/**
 * Valores por defecto cuando no hay `.env` / variables NEXT_PUBLIC_* en build.
 * Deben coincidir con `ccasaFrontend/.env.example`.
 */
export const NEXT_PUBLIC_DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ??
  'https://demos.themeselection.com/materio-mui-nextjs-admin-template/documentation'

export const NEXT_PUBLIC_PRO_URL =
  process.env.NEXT_PUBLIC_PRO_URL ??
  'https://demos.themeselection.com/materio-mui-nextjs-admin-template/demo-1'

export const NEXT_PUBLIC_REPO_NAME =
  process.env.NEXT_PUBLIC_REPO_NAME ?? 'materio-mui-nextjs-admin-template-free'
