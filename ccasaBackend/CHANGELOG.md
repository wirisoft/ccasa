# Changelog — Backend ccasa

## [Sin versionar] — 2 de abril de 2026

### Contexto

En el entorno de despliegue se **recreó el contenedor Docker de PostgreSQL** con **zona horaria UTC** (`TZ=UTC`, `PGTZ=UTC`, parámetro `-c timezone=UTC` en Postgres 16). Tras el despliegue se **recompiló el backend** (`./gradlew clean build`) y se reinició el servicio de aplicación.

---

### Problema encontrado

Con **Spring Boot 4.0.3** y **Spring Security 7.0.3**, los **filtros personalizados** (`RateLimitingFilter`, `ApiPathRewriteFilter`, `JWTAuthorizationFilter`) provocaban errores de arranque del tipo: el filtro **no tiene un orden registrado** (*registered order*).

Spring Security 7 exige que los filtros custom encajen en el **`FilterOrderRegistration`**. El uso de **`addFilterBefore` / `addFilterAfter`** anclando a **otros filtros custom** (o sin registro explícito adecuado) deja de ser válido de la misma forma que en versiones anteriores.

---

### Solución implementada

Se agrupó la lógica de los tres filtros en **un solo filtro compuesto** registrado con **`addFilterAt(..., UsernamePasswordAuthenticationFilter.class)`**, cumpliendo el modelo de ordenación de Spring Security 7.

#### Archivos creados

| Archivo | Descripción |
|--------|-------------|
| **`SecurityFilterOrder.java`** | Define la constante **`PRE_AUTHENTICATION_PIPELINE`** (orden relativo antes del filtro de usuario/contraseña, referencia ~1100 en SS7). |
| **`CcasaSecurityPipelineFilter.java`** | Filtro compuesto que encadena **ApiPathRewrite → RateLimiting → JWT** y se registra con **`addFilterAt`** respecto a `UsernamePasswordAuthenticationFilter`. |
| **`SecurityPathPatterns.java`** | Centraliza rutas públicas (**auth**, **actuator**, **h2-console**, **error**) para alinear **JWT**, **rate limiting** y **`authorizeHttpRequests`**. |

#### Archivos modificados

| Archivo | Descripción |
|--------|-------------|
| **`SecurityConfiguration.java`** | Usa **`CcasaSecurityPipelineFilter`** con **`addFilterAt`**; **`permitAll`** para **`/api/v1/auth/**`** y **`/v1/auth/**`**; **`/actuator/**`** en `permitAll` (alineado con el salto de JWT). |
| **`RateLimitingFilter.java`** | Usa **`SecurityPathPatterns`** para detectar endpoints limitados; se eliminó **`implements Ordered`** (el orden lo aporta el pipeline compuesto). |
| **`ApiPathRewriteFilter.java`** | Se eliminó **`implements Ordered`**; sigue reescribiendo **`/v1/...` → `/api/v1/...`** cuando el proxy quita el prefijo `/api`. |
| **`JWTAuthorizationFilter.java`** | Usa **`SecurityPathPatterns.isPublicForJwt`**; se eliminó **`implements Ordered`**. |

---

### Problema secundario resuelto

El endpoint **`/api/v1/auth/login`** devolvía **401** (*Full authentication is required to access this resource*) porque, tras el **proxy inverso (nginx)**, la petición podía llegar a Spring como **`/v1/auth/login`** (sin prefijo **`/api`**). Los **`requestMatchers`** solo contemplaban **`/api/v1/auth/**`**, por lo que la petición caía en **`anyRequest().authenticated()`**.

**Corrección:** se añadieron **ambos patrones** en **`permitAll`** y en la lógica de rutas públicas del JWT (**`/api/v1/auth/**`** y **`/v1/auth/**`**), manteniendo la misma semántica en **rate limiting** para login/register/forgot-password.

---

### Notas para el equipo

- El contenedor **PostgreSQL en Docker** debe ejecutarse en **UTC** para coherencia con la aplicación (`spring.jackson.time-zone=UTC`, Hibernate `jdbc.time_zone=UTC`).
- Si se **borra el volumen** de datos al recrear el contenedor, la base queda **vacía**; con **`ddl-auto=update`**, Hibernate **crea o actualiza tablas** al arrancar. Revisar **DataLoader** / usuarios iniciales según el entorno.
- Los **avisos de Spring Data Redis** en el arranque (*Could not safely identify store assignment…*) son **habituales** cuando no hay repositorios Redis; **no indican fallo** si no se usa persistencia Redis en la app.
- En **producción** conviene **restringir** el acceso a Actuator: valorar pasar de **`/actuator/**`** a algo más acotado (por ejemplo solo **`/actuator/health`**) y proteger métricas con autenticación o red.

---

*Documento generado para el historial de cambios del backend ccasa.*
