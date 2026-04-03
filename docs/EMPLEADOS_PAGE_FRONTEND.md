# `ccasaFrontend/src/app/(dashboard)/empleados/page.tsx`

Página de empleados del dashboard. Es un componente cliente (`'use client'`); en esta carpeta solo existe `page.tsx` (no hay `*Client.tsx` aparte). Usa `CrudListPanel` con la entrada `users` de `SUPPORT_BACKEND`.

```tsx
'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Component Imports
import CrudListPanel from '@components/ccasa/CrudListPanel'

// Config Imports
import { SUPPORT_BACKEND } from '@configs/backendApiRegistry'

const Page = () => {
  const s = SUPPORT_BACKEND.find(x => x.key === 'users')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Empleados</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={s.label}
        subtitle={`${s.controllerHint} · CrudResponseDTO (mapa values por campo de entidad).`}
        apiPath={s.crudBasePath}
      />
    </Stack>
  )
}

export default Page
```
