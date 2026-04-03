# Alertas, firmas: enums backend y páginas frontend

Documento generado a partir del código del repositorio: enums `AlertStatusEnum` y `SignatureTypeEnum` en el backend, y existencia/contenido de las rutas de dashboard **Alertas** y **Firmas** en el frontend.

---

## Frontend: ¿existen las páginas?

| Ruta | ¿Existe? | Notas |
|------|----------|--------|
| `src/app/(dashboard)/alertas/` | Sí | Solo `page.tsx`, con `'use client'`. No hay componente `*Client.tsx` separado. |
| `src/app/(dashboard)/firmas/` | Sí | Mismo patrón: solo `page.tsx` como componente cliente. |

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/enums/AlertStatusEnum.java`

```java
package com.backend.ccasa.service.models.enums;

/**
 * Estado de alerta (RF-06, RF-09, UI-02).
 */
public enum AlertStatusEnum {
	Pending,
	Resolved
}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/enums/SignatureTypeEnum.java`

```java
package com.backend.ccasa.service.models.enums;

/**
 * Tipo de firma (RF-02).
 */
public enum SignatureTypeEnum {
	Analyst,
	Supervisor
}

```

---

## `ccasaFrontend/src/app/(dashboard)/alertas/page.tsx`

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
  const s = SUPPORT_BACKEND.find(x => x.key === 'alerts')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Alertas</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={s.label}
        subtitle='Listado activo vía AlertCrudService (reglas automáticas en backend).'
        apiPath={s.crudBasePath}
      />
    </Stack>
  )
}

export default Page
```

---

## `ccasaFrontend/src/app/(dashboard)/firmas/page.tsx`

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
  const s = SUPPORT_BACKEND.find(x => x.key === 'signatures')!

  return (
    <Stack spacing={4}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <Typography variant='h5'>Firmas</Typography>
        <Button component={Link} href='/' variant='outlined' size='small'>
          Inicio
        </Button>
      </div>
      <CrudListPanel
        title={s.label}
        subtitle='Registros de firma asociados a entradas (SignatureCrudController).'
        apiPath={s.crudBasePath}
      />
    </Stack>
  )
}

export default Page
```
