import { Suspense } from 'react'

import Login from '@views/Login'

const LoginPage = () => (
  <Suspense fallback={null}>
    <Login />
  </Suspense>
)

export default LoginPage
