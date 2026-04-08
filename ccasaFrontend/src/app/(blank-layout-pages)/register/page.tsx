import { Suspense } from 'react'

import Register from '@views/Register'

const RegisterPage = () => (
  <Suspense fallback={null}>
    <Register />
  </Suspense>
)

export default RegisterPage
