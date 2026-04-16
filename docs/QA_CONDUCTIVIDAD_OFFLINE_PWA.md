# QA — Conductividad offline / cola PWA (ccasaFrontend)

Plan de pruebas para validar la cola local (IndexedDB), caché de bitácoras, sincronización FIFO y exportación `.sql` implementados en el panel de conductividad.

## Prerrequisitos

1. Ejecutar el frontend en **modo producción** (`npm run build` y `npm run start`). El service worker **no** se registra en `next dev`.
2. Entorno accesible como **HTTPS** o **localhost** (requisito típico del service worker).
3. Usuario con sesión activa, permisos de **conductividad** y al menos una **bitácora** listada por el API.
4. **Chrome DevTools** (o equivalente): pestañas **Application** → IndexedDB (`ccasa_conductivity_offline_v1`), **Network** (throttling / modo Offline), opcionalmente **Console**.

## Limitación conocida

Si es la **primera** visita a la ruta de conductividad **ya sin red** y el navegador no tiene el bundle en caché, la pantalla puede no cargar el módulo. El flujo offline del formulario asume **al menos una visita con red** previa a esa URL (PWA + `dynamic import`).

---

## TC-01 — Caché de bitácoras con red

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red, abrir **Entradas → Conductividad**. | La tabla carga o muestra estado vacío sin error bloqueante. |
| 2 | Pulsar **Nuevo registro** y revisar el desplegable **Bitácora**. | Opciones alineadas con el backend. |
| 3 | En DevTools → **Application** → **IndexedDB** → `ccasa_conductivity_offline_v1` → almacén `meta` → clave `logbooks_v1`. | Existe registro con `logbooks` y `updatedAt` reciente. |

---

## TC-02 — Sin red: formulario con caché de bitácoras

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Tras TC-01, activar **Offline** en DevTools (o cortar red). | Chip **Sin conexión**; aviso de modo sin conexión visible. |
| 2 | Recargar la página de conductividad (F5), si la app ya estaba en caché. | La vista de conductividad carga. |
| 3 | **Nuevo registro**. | El diálogo abre. Si la lista de bitácoras viene de caché: aviso **“Lista de bitácoras desde caché local”** y desplegable usable. |

---

## TC-03 — Encolar guardado offline (cola FIFO)

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Sin red, completar tipo, peso y bitácora; pulsar **Guardar**. | El diálogo se cierra; mensaje de éxito indicando guardado en **cola local** y envío al reconectar. |
| 2 | Revisar IndexedDB → almacén `conductivity_outbox`. | Nuevo ítem con `payload` correcto (`type`, `weightGrams`, `logbookId`, etc.). |
| 3 | Revisar la barra de chips / banner. | **Cola: 1** (o N) e información de pendientes. |

---

## TC-04 — Varios pendientes y orden FIFO

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Sin red, crear **dos** registros distintos (distinto peso o tipo). | Cola muestra **2**; dos filas en `conductivity_outbox`. |
| 2 | Restaurar red; esperar unos segundos o pulsar **Sincronizar ahora**. | Mensaje de éxito indicando sincronización; contador de cola en **0**. |
| 3 | Refrescar listado (**Buscar** o recargar) y verificar en backend si aplica. | **Dos** registros creados; el **primero** guardado en cola debe corresponder al **primero** procesado en servidor (orden FIFO). |

---

## TC-05 — Sincronización al evento `online`

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Dejar **un** ítem en cola (sin red + guardar). | Cola = 1. |
| 2 | Quitar modo Offline / restaurar red. | Tras el evento **online**, la cola debería vaciarse automáticamente; si no, **Sincronizar ahora** debe vaciarla. |

---

## TC-06 — Exportar cola `.sql`

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con al menos un pendiente en cola, pulsar **Exportar cola (.sql)**. | Se descarga un `.sql` con `CREATE TABLE` y sentencias `INSERT` con el JSON del payload. |
| 2 | Tras vaciar la cola. | El banner de pendientes desaparece; no debe quedar basura inconsistente en IndexedDB para ítems ya enviados. |

---

## TC-07 — Errores de negocio vs error de red

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | **Con red**, enviar datos que provoquen **400/422** (si el caso es reproducible). | Error de validación del servidor; **no** debe tratarse como guardado solo por fallo de red. |
| 2 | **Con red**, sesión expirada (**401**) al guardar o al sincronizar. | Comportamiento de auth actual (p. ej. redirección a login); la cola no debe marcar como enviado lo que el servidor rechazó. |

---

## TC-08 — Prefetch / regresión de carga

| Paso | Acción | Resultado esperado |
|------|--------|---------------------|
| 1 | Con red, navegar desde inicio/dashboard hacia **Conductividad**. | La pantalla carga sin errores; sin regresiones evidentes en consola. |

---

## Criterios de aceptación global

- [ ] Sin red (con caché de bitácoras): **Nuevo registro** y **Guardar** encolan correctamente.
- [ ] Con red restaurada: la cola se procesa en **FIFO** y los registros aparecen en el listado/servidor.
- [ ] La UI refleja **en línea / sin conexión**, el **tamaño de cola**, avisos de **caché de bitácoras** y las acciones **Sincronizar ahora** y **Exportar cola (.sql)**.
- [ ] No hay errores críticos en consola durante los flujos anteriores.

---

## Referencia técnica (implementación)

| Área | Ubicación |
|------|-----------|
| Cola + caché IndexedDB | `ccasaFrontend/src/lib/ccasa/conductivityOfflineDb.ts` |
| UI y lógica de sincronización | `ccasaFrontend/src/components/ccasa/ConductivityPanel.tsx` |
| Prefetch del chunk | `ccasaFrontend/src/app/(dashboard)/entradas/[slug]/EntradaTipoClient.tsx` |
