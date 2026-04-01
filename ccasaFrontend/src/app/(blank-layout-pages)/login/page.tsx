// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

function safeInternalPath(next: string | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/'
  }

  return decodeURIComponent(next)
}

type LoginPageProps = {
  searchParams: { next?: string }
}

const LoginPage = ({ searchParams }: LoginPageProps) => {
  const mode = getServerMode()
  const redirectTo = safeInternalPath(searchParams.next)

  return <Login mode={mode} redirectTo={redirectTo} />
}

export default LoginPage
