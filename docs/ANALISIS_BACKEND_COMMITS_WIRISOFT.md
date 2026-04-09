# Análisis de commits recientes en ccasaBackend (wirisoft)

Documento generado a partir de `git log`, `git show --stat` y el árbol de trabajo en `ccasaBackend`.  
**Compañero backend:** wirisoft `<wirideveloper@gmail.com>`. **Tus commits** (Fermin Cardenas Cabal) se excluyen del foco salvo cuando el estado actual del repo los mezcla (p. ej. seguridad).

**Índice:** [1. Comando git](#1-comando-últimos-20-commits) · [2. Commits wirisoft](#2-commits-del-compañero-en-ese-rango-no-tuyos) · [3. Stat por commit](#3-git-show--stat-por-commit-wirisoft) · [4. Resumen API/frontend](#4-resumen-estructurado-api-y-frontend) · [5. Diffs](#5-diffs-puntuales-wirisoft) · [6. Código incrustado](#6-archivos-relevantes--contenido-completo) · [7–8. Anexos](#7-anexo-a--crudentitymapperjava-contenido-completo) · [9. Nota](#9-nota)

---

## 1. Comando: últimos 20 commits

Ejecutar desde `ccasaBackend` (PowerShell):

```powershell
Set-Location c:\koreano\ccasa\ccasaBackend
git log --oneline -20 --format="%h %an <%ae> %s"
```

---

## 2. Commits del compañero en ese rango (no tuyos)

| Hash | Autor | Mensaje (resumen) |
|------|--------|-------------------|
| `6148913` | wirisoft | ObjectMapper local en `FormulaCatalogSeedService` (Boot 4) |
| `0d03bcf` | wirisoft | `spring-boot-starter-json` + `.gitignore` Python |
| `2162b2d` | wirisoft | Inicialización laboratorio, fórmulas, entidades, seed JSONL |
| `7ff3e9d` | wirisoft | `spring.session.store-type=none` |
| `3f923b9` | wirisoft | Ajuste `build.gradle` (session/JOSE) |
| `239885e` | wirisoft | CORS / dominio SSL (+ `ccasaFrontend` en el mismo commit) |
| `b2fdb9e` | wirisoft | Pruebas servidor (+ frontend) |
| `50e985c` | wirisoft | Docs + `ccasa_schema_postgresql.sql` |
| `d71cd82` | wirisoft | CRUD REST v2, `AuthController`, `CrudEntityMapper`, paquete `service.models` |
| `f5488a5` | wirisoft | CRUD REST v1, `AbstractEntityCrudService`, DTOs genéricos |
| `6188938` | wirisoft | Base backend (+ gran parte del frontend en el mismo commit) |
| `fc231b5` | wirisoft | first commit (`README`) |

---

## 3. `git show --stat` por commit (wirisoft)

### `6148913` — FormulaCatalogSeedService

- `.../config/FormulaCatalogSeedService.java`

### `0d03bcf` — Jackson Boot 4

- `.gitignore` (raíz repo)
- `ccasaBackend/build.gradle`

### `2162b2d` — Inicialización y fórmulas

Muchos archivos: `DataLoader`, `LaboratoryInitializationService`, `FormulaCatalogSeedService`, entidades `Lab*`, repositorios, `CrudEntityMapper` (+2 líneas), servicios `*Computation`, `catalog/formula_cells.jsonl`, scripts Python, `docs/sql/`, etc.

### `7ff3e9d` — Spring Session

- `application.properties`

### `3f923b9` — build.gradle

- `build.gradle` (−2 líneas)

### `239885e` — SSL / CORS

- `SecurityConfiguration.java`
- `ccasaFrontend/src/configs/api.ts`

### `b2fdb9e` — Servidor pruebas

- `SecurityConfiguration.java`, `application.properties`, `gradlew`, frontend `next.config.mjs`, `package-lock.json`

### `50e985c` — Documentación

- `docs/ARQUITECTURA_Y_MODELO_DATOS_CCASA.md`, `docs/README.md`, `docs/sql/ccasa_schema_postgresql.sql`

### `d71cd82` — CRUD v2 + auth

~116 archivos: elimina `AbstractCrudController`, añade `AuthController` y auth stack, refactor `AbstractEntityCrudService`, `CrudEntityMapper`, DTOs movidos a `service.models`, interfaces `ITypedCrudService`, etc.

### `f5488a5` — CRUD v1

~81 archivos: controladores CRUD, `AbstractEntityCrudService`, `IResourceCrudService`, `CrudRequestDTO` / `CrudResponseDTO`, repositorios `ActiveRepository`, etc.

### `6188938` / `fc231b5`

Base del proyecto y primer commit (ver `git show` para lista completa).

---

## 4. Resumen estructurado (API y frontend)

### 4.1 Controladores y endpoints nuevos o relevantes

- **`AuthController`** (`/api/v1/auth`), commit `d71cd82`:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/init-admin`
- **CRUD genérico** por recurso (`f5488a5` + `d71cd82`), patrón: `POST`, `GET`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` bajo `/api/v1/...`:

  `alerts`, `batches`, `entries`, `entry-accuracy`, `entry-conductivity`, `entry-distilled-water`, `entry-drying-oven`, `entry-expense-chart`, `entry-flask-treatment`, `entry-material-wash`, `entry-oven-temp`, `entry-solution-prep`, `entry-weighing`, `folio-blocks`, `folios`, `reagents`, `reagent-jars`, `roles`, `signatures`, `solutions`, `supplies`, `users`.

- **Sin REST** dedicado para catálogo `lab_formula_cell`, `lab_equipment`, `lab_reference_parameter` (solo persistencia + seed).

### 4.2 Entidades y DTOs

- Nuevas: `LabFormulaCellEntity`, `LaboratoryEquipmentEntity`, `ReferenceParameterEntity` (`2162b2d`).
- Modificada: `EntryConductivityEntity` — `weightGrams`, `calculatedMol`, `calculatedValue`, etc.
- Auth: `AuthLoginRequestDTO`, `AuthRegisterRequestDTO`, `AuthResponseDTO`.
- CRUD: `CrudRequestDTO` / `CrudResponseDTO` (`Map<String, Object>`).
- Reubicación de paquete: `com.backend.ccasa.services.models` → `com.backend.ccasa.service.models` (`d71cd82`).

### 4.3 CrudEntityMapper

- Introducido en **`d71cd82`** (mapeo por tipo de entidad).
- **`2162b2d`**: mapeo de **`weightGrams`** en `EntryConductivityEntity` (apply + `toValues`). Ver sección 5 y anexo A.

### 4.4 SecurityPathPatterns

- **Ningún commit de wirisoft** toca `SecurityPathPatterns.java`. El historial del archivo incluye commit tuyo `f5a1ad5`.

### 4.5 Servicios, enums, configuración

- `AuthServiceImpl`, `IAuthService`, `AuthException`, `GlobalExceptionHandler` (`d71cd82`).
- `LaboratoryInitializationService`, `FormulaCatalogSeedService`, `DataLoader`, `InitialCatalogData`, clases `*Computation`, `ReferenceParameterCodes`, etc. (`2162b2d`).
- `application.properties`: `spring.session.store-type=none` (`7ff3e9d`); `ccasa.formula-catalog.seed-enabled` (`2162b2d`).
- `build.gradle`: `spring-boot-starter-json` (`0d03bcf`).
- `SecurityConfiguration`: CORS / orígenes (`239885e`, `b2fdb9e`); el archivo actual puede incluir también tus cambios (auth, pipeline).

### 4.6 Impacto frontend (commits del compañero)

- `239885e`, `b2fdb9e` modifican `ccasaFrontend` (`api.ts`, `next.config.mjs`, etc.).

### 4.7 Artefactos grandes

- `src/main/resources/catalog/formula_cells.jsonl`, `excel_formulas.json` en raíz: no se incrustan aquí; son datos/generados para el seed.

---

## 5. Diffs puntuales (wirisoft)

### 5.1 `CrudEntityMapper` — commit `2162b2d` (`weightGrams`)

```diff
--- a/ccasaBackend/src/main/java/com/backend/ccasa/service/impl/support/CrudEntityMapper.java
+++ b/ccasaBackend/src/main/java/com/backend/ccasa/service/impl/support/CrudEntityMapper.java
@@ -138,6 +138,7 @@ public final class CrudEntityMapper {
 		if (entity instanceof EntryConductivityEntity e) {
 			if (values.containsKey("type")) e.setType(CrudValueHelper.asEnum(values.get("type"), ConductivityTypeEnum.class));
 			if (values.containsKey("measuredValue")) e.setMeasuredValue(CrudValueHelper.asBigDecimal(values.get("measuredValue")));
+			if (values.containsKey("weightGrams")) e.setWeightGrams(CrudValueHelper.asBigDecimal(values.get("weightGrams")));
 			if (values.containsKey("calculatedMol")) e.setCalculatedMol(CrudValueHelper.asBigDecimal(values.get("calculatedMol")));
@@ -355,6 +356,7 @@ public final class CrudEntityMapper {
 			values.put("entryId", idOf(e.getEntry()));
 			values.put("type", e.getType());
 			values.put("measuredValue", e.getMeasuredValue());
+			values.put("weightGrams", e.getWeightGrams());
 			values.put("calculatedMol", e.getCalculatedMol());
```

### 5.2 `build.gradle` — commit `0d03bcf`

```diff
+	/** Jackson + bean {@code ObjectMapper} ... Boot 4 no lo registra solo. */
+	implementation 'org.springframework.boot:spring-boot-starter-json'
```

### 5.3 `application.properties` — commit `7ff3e9d`

```diff
+spring.session.store-type=none
```

### 5.4 `SecurityConfiguration` (CORS) — commit `239885e` (extracto)

Añade orígenes `http://ccasa.hexvorn.cloud` y `https://ccasa.hexvorn.cloud`; ajusta lista respecto a localhost/5173. En el estado actual del repo puede haber **`http://localhost:3000` duplicado** en `setAllowedOriginPatterns` (revisar y deduplicar).

---

## 6. Archivos relevantes — contenido completo

Las rutas son relativas al repo `ccasa` salvo que se indique `ccasaBackend/`.

### 6.1 `ccasaBackend/src/main/java/com/backend/ccasa/controllers/AuthController.java`

```java
package com.backend.ccasa.controllers;

import com.backend.ccasa.service.IAuthService;
import com.backend.ccasa.service.models.dtos.AuthLoginRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthRegisterRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final IAuthService authService;

	public AuthController(IAuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody AuthRegisterRequestDTO request) {
		return ResponseEntity.ok(authService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthLoginRequestDTO request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/init-admin")
	public ResponseEntity<AuthResponseDTO> createInitialAdmin() {
		return ResponseEntity.ok(authService.createInitialAdmin());
	}
}
```

### 6.2 `ccasaBackend/src/main/java/com/backend/ccasa/service/IAuthService.java`

```java
package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.AuthLoginRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthRegisterRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthResponseDTO;

public interface IAuthService {

	AuthResponseDTO register(AuthRegisterRequestDTO request);

	AuthResponseDTO login(AuthLoginRequestDTO request);

	AuthResponseDTO createInitialAdmin();
}
```

### 6.3 `ccasaBackend/src/main/java/com/backend/ccasa/service/impl/AuthServiceImpl.java`

```java
package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.AuthException;
import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.RoleRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.IAuthService;
import com.backend.ccasa.service.IJWTUtilityService;
import com.backend.ccasa.service.models.dtos.AuthLoginRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthRegisterRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthResponseDTO;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import com.nimbusds.jose.JOSEException;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements IAuthService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final IJWTUtilityService jwtUtilityService;

	public AuthServiceImpl(
		UserRepository userRepository,
		RoleRepository roleRepository,
		PasswordEncoder passwordEncoder,
		IJWTUtilityService jwtUtilityService
	) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtilityService = jwtUtilityService;
	}

	@Override
	@Transactional
	public AuthResponseDTO register(AuthRegisterRequestDTO request) {
		String email = normalizedEmail(request.email());
		if (userRepository.findByEmail(email).isPresent()) {
			throw new AuthException("AUTH_EMAIL_ALREADY_EXISTS", "Ya existe un usuario registrado con ese email.");
		}

		RoleEntity defaultRole = roleRepository.findByName(RoleNameEnum.Analyst)
			.orElseGet(() -> {
				RoleEntity role = new RoleEntity();
				role.setName(RoleNameEnum.Analyst);
				role.setDescription("Rol por defecto para nuevos usuarios.");
				return roleRepository.save(role);
			});

		UserEntity user = new UserEntity();
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setRole(defaultRole);
		user.setActive(true);
		user = userRepository.save(user);

		return generateAuthResponse(user);
	}

	@Override
	@Transactional(readOnly = true)
	public AuthResponseDTO login(AuthLoginRequestDTO request) {
		String email = normalizedEmail(request.email());
		UserEntity user = userRepository.findByEmail(email)
			.orElseThrow(() -> new AuthException("AUTH_INVALID_CREDENTIALS", "Credenciales inválidas."));

		if (!user.isActive()) {
			throw new AuthException("AUTH_USER_INACTIVE", "El usuario está inactivo.");
		}

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new AuthException("AUTH_INVALID_CREDENTIALS", "Credenciales inválidas.");
		}

		return generateAuthResponse(user);
	}

	@Override
	@Transactional
	public AuthResponseDTO createInitialAdmin() {
		if (userRepository.findByEmail("admin@ccasa.local").isPresent()) {
			throw new AuthException("AUTH_INITIAL_USER_EXISTS", "El usuario inicial ya existe.");
		}

		RoleEntity adminRole = roleRepository.findByName(RoleNameEnum.Admin)
			.orElseGet(() -> {
				RoleEntity role = new RoleEntity();
				role.setName(RoleNameEnum.Admin);
				role.setDescription("Administrador del sistema");
				return roleRepository.save(role);
			});

		UserEntity admin = new UserEntity();
		admin.setFirstName("Admin");
		admin.setLastName("Sistema");
		admin.setEmail("admin@ccasa.local");
		admin.setPasswordHash(passwordEncoder.encode("change-me"));
		admin.setRole(adminRole);
		admin.setActive(true);
		admin = userRepository.save(admin);

		return generateAuthResponse(admin);
	}

	private AuthResponseDTO generateAuthResponse(UserEntity user) {
		try {
			String role = user.getRole() != null && user.getRole().getName() != null
				? user.getRole().getName().name()
				: "USER";
			String token = jwtUtilityService.generateJWT(
				user.getId(),
				user.getEmail(),
				role,
				null,
				user.getFirstName(),
				user.getLastName(),
				List.of(role),
				List.of()
			);
			return new AuthResponseDTO(token, user.getId(), user.getEmail(), role);
		}
		catch (IOException | NoSuchAlgorithmException | InvalidKeySpecException | JOSEException ex) {
			throw new AuthException("AUTH_TOKEN_ERROR", "No fue posible generar el token de autenticación.");
		}
	}

	private String normalizedEmail(String email) {
		return email == null ? null : email.trim().toLowerCase();
	}
}
```

### 6.4 DTOs de auth y CRUD

**`ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/AuthLoginRequestDTO.java`**

```java
package com.backend.ccasa.service.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

public record AuthLoginRequestDTO(
	@NotBlank @Email String email,
	@NotBlank String password
) implements Serializable {
}
```

**`ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/AuthRegisterRequestDTO.java`**

```java
package com.backend.ccasa.service.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

public record AuthRegisterRequestDTO(
	@NotBlank String firstName,
	@NotBlank String lastName,
	@NotBlank @Email String email,
	@NotBlank String password
) implements Serializable {
}
```

**`ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/AuthResponseDTO.java`**

```java
package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;

public record AuthResponseDTO(
	String token,
	Long userId,
	String email,
	String role
) implements Serializable {
}
```

**`ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/CrudRequestDTO.java`**

```java
package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.util.Map;

public record CrudRequestDTO(Map<String, Object> values) implements Serializable {
}
```

**`ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/CrudResponseDTO.java`**

```java
package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.util.Map;

public record CrudResponseDTO(Long id, Map<String, Object> values) implements Serializable {
}
```

### 6.5 `ccasaBackend/src/main/java/com/backend/ccasa/exceptions/AuthException.java`

```java
package com.backend.ccasa.exceptions;

public class AuthException extends RuntimeException {

	private final String code;

	public AuthException(String code, String message) {
		super(message);
		this.code = code;
	}

	public String getCode() {
		return code;
	}
}
```

### 6.6 Entidades nuevas y conductividad

Los archivos **`LabFormulaCellEntity.java`**, **`LaboratoryEquipmentEntity.java`**, **`ReferenceParameterEntity.java`** y **`EntryConductivityEntity.java`** están en el repositorio bajo `ccasaBackend/src/main/java/com/backend/ccasa/persistence/entities/` (y `.../entry/` para conductividad). Por longitud, consulta el código fuente actual; el análisis funcional está en la sección 4.

### 6.7 `ccasaBackend/src/main/java/com/backend/ccasa/config/FormulaCatalogSeedService.java`

Ver fuente en el repo (semilla JSONL, `ObjectMapper` estático, propiedad `ccasa.formula-catalog.seed-enabled`).

### 6.8 `ccasaBackend/src/main/resources/application.properties`

Ver fuente en el repo (`spring.session.store-type=none`, datasource, JWT, `ccasa.formula-catalog.seed-enabled`).

### 6.9 `ccasaBackend/src/main/java/com/backend/ccasa/security/SecurityConfiguration.java`

Ver fuente en el repo (CORS, `permitAll` para `/api/v1/auth/**` y `/v1/auth/**`, pipeline de filtros).

### 6.10 Ejemplo CRUD — `ccasaBackend/src/main/java/com/backend/ccasa/controllers/crud/UserCrudController.java`

```java
package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.service.IUserCrudService;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserCrudController {

	private final IUserCrudService service;

	public UserCrudController(IUserCrudService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<CrudResponseDTO> create(@RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(service.create(request));
	}

	@GetMapping
	public ResponseEntity<List<CrudResponseDTO>> getAll() {
		return ResponseEntity.ok(service.findAllActive());
	}

	@GetMapping("/{id}")
	public ResponseEntity<CrudResponseDTO> getById(@PathVariable Long id) {
		return ResponseEntity.ok(service.findById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<CrudResponseDTO> update(@PathVariable Long id, @RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(service.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}
}
```

---

## 7. Anexo A — `CrudEntityMapper.java` (contenido completo)

*Archivo:* `ccasaBackend/src/main/java/com/backend/ccasa/service/impl/support/CrudEntityMapper.java`  
*Líneas:* 537 (estado al generar este documento).

<!-- ANEXO_CRUD_ENTITY_MAPPER_START -->

```java
package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.AlertEntity;
import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioBlockEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.ReagentEntity;
import com.backend.ccasa.persistence.entities.ReagentJarEntity;
import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.entities.SignatureEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.entities.SupplyEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity;
import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity;
import com.backend.ccasa.persistence.entities.entry.EntryDryingOvenEntity;
import com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity;
import com.backend.ccasa.persistence.entities.entry.EntryFlaskTreatmentEntity;
import com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity;
import com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity;
import com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity;
import com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity;
import com.backend.ccasa.service.models.enums.AlertStatusEnum;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import com.backend.ccasa.service.models.enums.FolioStatusEnum;
import com.backend.ccasa.service.models.enums.PieceTypeEnum;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import com.backend.ccasa.service.models.enums.SignatureTypeEnum;
import com.backend.ccasa.service.models.enums.WaterTypeEnum;
import jakarta.persistence.EntityManager;
import java.util.LinkedHashMap;
import java.util.Map;

public final class CrudEntityMapper {

	private CrudEntityMapper() {
	}

	public static <E extends Auditable> void apply(Class<E> entityClass, E entity, Map<String, Object> values, EntityManager entityManager) {
		applyAudit(entity, values, entityManager);
		if (entity instanceof RoleEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asEnum(values.get("name"), RoleNameEnum.class));
			if (values.containsKey("description")) e.setDescription(CrudValueHelper.asString(values.get("description")));
			return;
		}
		if (entity instanceof UserEntity e) {
			if (values.containsKey("firstName")) e.setFirstName(CrudValueHelper.asString(values.get("firstName")));
			if (values.containsKey("lastName")) e.setLastName(CrudValueHelper.asString(values.get("lastName")));
			if (values.containsKey("email")) e.setEmail(CrudValueHelper.asString(values.get("email")));
			if (values.containsKey("passwordHash")) e.setPasswordHash(CrudValueHelper.asString(values.get("passwordHash")));
			if (values.containsKey("active")) e.setActive(Boolean.TRUE.equals(CrudValueHelper.asBoolean(values.get("active"))));
			if (values.containsKey("roleId")) e.setRole(requireActive(entityManager, RoleEntity.class, values.get("roleId")));
			return;
		}
		if (entity instanceof LogbookEntity e) {
			if (values.containsKey("code")) e.setCode(CrudValueHelper.asInteger(values.get("code")));
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("description")) e.setDescription(CrudValueHelper.asString(values.get("description")));
			if (values.containsKey("maxEntries")) e.setMaxEntries(CrudValueHelper.asInteger(values.get("maxEntries")));
			return;
		}
		if (entity instanceof FolioBlockEntity e) {
			if (values.containsKey("identifier")) e.setIdentifier(CrudValueHelper.asString(values.get("identifier")));
			if (values.containsKey("startNumber")) e.setStartNumber(CrudValueHelper.asInteger(values.get("startNumber")));
			if (values.containsKey("endNumber")) e.setEndNumber(CrudValueHelper.asInteger(values.get("endNumber")));
			if (values.containsKey("coverGenerated")) e.setCoverGenerated(Boolean.TRUE.equals(CrudValueHelper.asBoolean(values.get("coverGenerated"))));
			return;
		}
		if (entity instanceof FolioEntity e) {
			if (values.containsKey("folioNumber")) e.setFolioNumber(CrudValueHelper.asInteger(values.get("folioNumber")));
			if (values.containsKey("status")) e.setStatus(CrudValueHelper.asEnum(values.get("status"), FolioStatusEnum.class));
			if (values.containsKey("folioBlockId")) e.setFolioBlock(requireActive(entityManager, FolioBlockEntity.class, values.get("folioBlockId")));
			if (values.containsKey("logbookId")) e.setLogbook(requireActive(entityManager, LogbookEntity.class, values.get("logbookId")));
			return;
		}
		if (entity instanceof EntryEntity e) {
			if (values.containsKey("recordedAt")) e.setRecordedAt(CrudValueHelper.asInstant(values.get("recordedAt")));
			if (values.containsKey("status")) e.setStatus(CrudValueHelper.asEnum(values.get("status"), EntryStatusEnum.class));
			if (values.containsKey("folioId")) e.setFolio(requireActive(entityManager, FolioEntity.class, values.get("folioId")));
			if (values.containsKey("logbookId")) e.setLogbook(requireActive(entityManager, LogbookEntity.class, values.get("logbookId")));
			if (values.containsKey("userId")) e.setUser(requireActive(entityManager, UserEntity.class, values.get("userId")));
			return;
		}
		if (entity instanceof AlertEntity e) {
			if (values.containsKey("type")) e.setType(CrudValueHelper.asString(values.get("type")));
			if (values.containsKey("message")) e.setMessage(CrudValueHelper.asString(values.get("message")));
			if (values.containsKey("generatedAt")) e.setGeneratedAt(CrudValueHelper.asInstant(values.get("generatedAt")));
			if (values.containsKey("status")) e.setStatus(CrudValueHelper.asEnum(values.get("status"), AlertStatusEnum.class));
			if (values.containsKey("targetUserId")) e.setTargetUser(requireActive(entityManager, UserEntity.class, values.get("targetUserId")));
			return;
		}
		if (entity instanceof SignatureEntity e) {
			if (values.containsKey("signedAt")) e.setSignedAt(CrudValueHelper.asInstant(values.get("signedAt")));
			if (values.containsKey("signatureType")) e.setSignatureType(CrudValueHelper.asEnum(values.get("signatureType"), SignatureTypeEnum.class));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		if (entity instanceof ReagentEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("chemicalFormula")) e.setChemicalFormula(CrudValueHelper.asString(values.get("chemicalFormula")));
			if (values.containsKey("unit")) e.setUnit(CrudValueHelper.asString(values.get("unit")));
			if (values.containsKey("totalStock")) e.setTotalStock(CrudValueHelper.asBigDecimal(values.get("totalStock")));
			return;
		}
		if (entity instanceof BatchEntity e) {
			if (values.containsKey("batchCode")) e.setBatchCode(CrudValueHelper.asString(values.get("batchCode")));
			if (values.containsKey("generatedAt")) e.setGeneratedAt(CrudValueHelper.asLocalDate(values.get("generatedAt")));
			if (values.containsKey("startDate")) e.setStartDate(CrudValueHelper.asLocalDate(values.get("startDate")));
			if (values.containsKey("endDate")) e.setEndDate(CrudValueHelper.asLocalDate(values.get("endDate")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			return;
		}
		if (entity instanceof ReagentJarEntity e) {
			if (values.containsKey("initialAmountG")) e.setInitialAmountG(CrudValueHelper.asBigDecimal(values.get("initialAmountG")));
			if (values.containsKey("currentAmountG")) e.setCurrentAmountG(CrudValueHelper.asBigDecimal(values.get("currentAmountG")));
			if (values.containsKey("openedAt")) e.setOpenedAt(CrudValueHelper.asLocalDate(values.get("openedAt")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			return;
		}
		if (entity instanceof SolutionEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("concentration")) e.setConcentration(CrudValueHelper.asString(values.get("concentration")));
			if (values.containsKey("quantity")) e.setQuantity(CrudValueHelper.asString(values.get("quantity")));
			return;
		}
		if (entity instanceof SupplyEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("availableQty")) e.setAvailableQty(CrudValueHelper.asBigDecimal(values.get("availableQty")));
			if (values.containsKey("unit")) e.setUnit(CrudValueHelper.asString(values.get("unit")));
			return;
		}
		if (entity instanceof EntryConductivityEntity e) {
			if (values.containsKey("type")) e.setType(CrudValueHelper.asEnum(values.get("type"), ConductivityTypeEnum.class));
			if (values.containsKey("measuredValue")) e.setMeasuredValue(CrudValueHelper.asBigDecimal(values.get("measuredValue")));
			if (values.containsKey("weightGrams")) e.setWeightGrams(CrudValueHelper.asBigDecimal(values.get("weightGrams")));
			if (values.containsKey("calculatedMol")) e.setCalculatedMol(CrudValueHelper.asBigDecimal(values.get("calculatedMol")));
			if (values.containsKey("calculatedValue")) e.setCalculatedValue(CrudValueHelper.asBigDecimal(values.get("calculatedValue")));
			if (values.containsKey("inRange")) e.setInRange(CrudValueHelper.asBoolean(values.get("inRange")));
			if (values.containsKey("autoDate")) e.setAutoDate(CrudValueHelper.asInstant(values.get("autoDate")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			return;
		}
		if (entity instanceof EntryDistilledWaterEntity e) {
			if (values.containsKey("phReading1")) e.setPhReading1(CrudValueHelper.asBigDecimal(values.get("phReading1")));
			if (values.containsKey("phReading2")) e.setPhReading2(CrudValueHelper.asBigDecimal(values.get("phReading2")));
			if (values.containsKey("phReading3")) e.setPhReading3(CrudValueHelper.asBigDecimal(values.get("phReading3")));
			if (values.containsKey("phAverage")) e.setPhAverage(CrudValueHelper.asBigDecimal(values.get("phAverage")));
			if (values.containsKey("ceReading1")) e.setCeReading1(CrudValueHelper.asBigDecimal(values.get("ceReading1")));
			if (values.containsKey("ceReading2")) e.setCeReading2(CrudValueHelper.asBigDecimal(values.get("ceReading2")));
			if (values.containsKey("ceReading3")) e.setCeReading3(CrudValueHelper.asBigDecimal(values.get("ceReading3")));
			if (values.containsKey("ceAverage")) e.setCeAverage(CrudValueHelper.asBigDecimal(values.get("ceAverage")));
			if (values.containsKey("referenceDifference")) e.setReferenceDifference(CrudValueHelper.asBigDecimal(values.get("referenceDifference")));
			if (values.containsKey("controlStandardPct")) e.setControlStandardPct(CrudValueHelper.asBigDecimal(values.get("controlStandardPct")));
			if (values.containsKey("isAcceptable")) e.setIsAcceptable(CrudValueHelper.asBoolean(values.get("isAcceptable")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("waterBatchId")) e.setWaterBatch(requireActive(entityManager, BatchEntity.class, values.get("waterBatchId")));
			return;
		}
		if (entity instanceof EntryOvenTempEntity e) {
			if (values.containsKey("rawTemperature")) e.setRawTemperature(CrudValueHelper.asBigDecimal(values.get("rawTemperature")));
			if (values.containsKey("correctedTemperature")) e.setCorrectedTemperature(CrudValueHelper.asBigDecimal(values.get("correctedTemperature")));
			if (values.containsKey("readingNumber")) e.setReadingNumber(CrudValueHelper.asInteger(values.get("readingNumber")));
			if (values.containsKey("recordedAt")) e.setRecordedAt(CrudValueHelper.asInstant(values.get("recordedAt")));
			if (values.containsKey("inRange")) e.setInRange(CrudValueHelper.asBoolean(values.get("inRange")));
			if (values.containsKey("isMaintenance")) e.setIsMaintenance(CrudValueHelper.asBoolean(values.get("isMaintenance")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			return;
		}
		if (entity instanceof EntryWeighingEntity e) {
			if (values.containsKey("weightGrams")) e.setWeightGrams(CrudValueHelper.asBigDecimal(values.get("weightGrams")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			if (values.containsKey("targetSolutionId")) e.setTargetSolution(requireActive(entityManager, SolutionEntity.class, values.get("targetSolutionId")));
			return;
		}
		if (entity instanceof EntryMaterialWashEntity e) {
			if (values.containsKey("mondayDate")) e.setMondayDate(CrudValueHelper.asLocalDate(values.get("mondayDate")));
			if (values.containsKey("pieceType")) e.setPieceType(CrudValueHelper.asEnum(values.get("pieceType"), PieceTypeEnum.class));
			if (values.containsKey("material")) e.setMaterial(CrudValueHelper.asString(values.get("material")));
			if (values.containsKey("determination")) e.setDetermination(CrudValueHelper.asString(values.get("determination")));
			if (values.containsKey("color")) e.setColor(CrudValueHelper.asString(values.get("color")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("analystUserId")) e.setAnalystUser(requireActive(entityManager, UserEntity.class, values.get("analystUserId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		if (entity instanceof EntrySolutionPrepEntity e) {
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("solutionId")) e.setSolution(requireActive(entityManager, SolutionEntity.class, values.get("solutionId")));
			if (values.containsKey("weighingEntryId")) e.setWeighingEntry(requireActive(entityManager, EntryWeighingEntity.class, values.get("weighingEntryId")));
			if (values.containsKey("analystUserId")) e.setAnalystUser(requireActive(entityManager, UserEntity.class, values.get("analystUserId")));
			return;
		}
		if (entity instanceof EntryDryingOvenEntity e) {
			if (values.containsKey("entryTime")) e.setEntryTime(CrudValueHelper.asLocalTime(values.get("entryTime")));
			if (values.containsKey("exitTime")) e.setExitTime(CrudValueHelper.asLocalTime(values.get("exitTime")));
			if (values.containsKey("meetsTemp")) e.setMeetsTemp(CrudValueHelper.asBoolean(values.get("meetsTemp")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			if (values.containsKey("analystUserId")) e.setAnalystUser(requireActive(entityManager, UserEntity.class, values.get("analystUserId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		if (entity instanceof EntryAccuracyEntity e) {
			if (values.containsKey("batch1Avg")) e.setBatch1Avg(CrudValueHelper.asBigDecimal(values.get("batch1Avg")));
			if (values.containsKey("batch2Avg")) e.setBatch2Avg(CrudValueHelper.asBigDecimal(values.get("batch2Avg")));
			if (values.containsKey("difference")) e.setDifference(CrudValueHelper.asBigDecimal(values.get("difference")));
			if (values.containsKey("inRange")) e.setInRange(CrudValueHelper.asBoolean(values.get("inRange")));
			if (values.containsKey("phFolioNumber")) e.setPhFolioNumber(CrudValueHelper.asInteger(values.get("phFolioNumber")));
			if (values.containsKey("dailyRecordDate")) e.setDailyRecordDate(CrudValueHelper.asLocalDate(values.get("dailyRecordDate")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("samplerUserId")) e.setSamplerUser(requireActive(entityManager, UserEntity.class, values.get("samplerUserId")));
			if (values.containsKey("phLogbookId")) e.setPhLogbook(requireActive(entityManager, LogbookEntity.class, values.get("phLogbookId")));
			return;
		}
		if (entity instanceof EntryExpenseChartEntity e) {
			if (values.containsKey("employmentDate")) e.setEmploymentDate(CrudValueHelper.asLocalDate(values.get("employmentDate")));
			if (values.containsKey("endDate")) e.setEndDate(CrudValueHelper.asLocalDate(values.get("endDate")));
			if (values.containsKey("equipmentKey")) e.setEquipmentKey(CrudValueHelper.asString(values.get("equipmentKey")));
			if (values.containsKey("distilledWaterQty")) e.setDistilledWaterQty(CrudValueHelper.asBigDecimal(values.get("distilledWaterQty")));
			if (values.containsKey("waterType")) e.setWaterType(CrudValueHelper.asEnum(values.get("waterType"), WaterTypeEnum.class));
			if (values.containsKey("kclUsedG")) e.setKclUsedG(CrudValueHelper.asBigDecimal(values.get("kclUsedG")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("batchId")) e.setBatch(requireActive(entityManager, BatchEntity.class, values.get("batchId")));
			if (values.containsKey("kclJarId")) e.setKclJar(requireActive(entityManager, ReagentJarEntity.class, values.get("kclJarId")));
			return;
		}
		if (entity instanceof EntryFlaskTreatmentEntity e) {
			if (values.containsKey("swabsUsed")) e.setSwabsUsed(CrudValueHelper.asInteger(values.get("swabsUsed")));
			if (values.containsKey("analysisValue")) e.setAnalysisValue(CrudValueHelper.asBigDecimal(values.get("analysisValue")));
			if (values.containsKey("cmcResult")) e.setCmcResult(CrudValueHelper.asString(values.get("cmcResult")));
			if (values.containsKey("reportDate")) e.setReportDate(CrudValueHelper.asLocalDate(values.get("reportDate")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("washEntryId")) e.setWashEntry(requireActive(entityManager, EntryMaterialWashEntity.class, values.get("washEntryId")));
			if (values.containsKey("swabSupplyId")) e.setSwabSupply(requireActive(entityManager, SupplyEntity.class, values.get("swabSupplyId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		throw new IllegalArgumentException("Unsupported entity for CRUD mapping: " + entityClass.getSimpleName());
	}

	public static <E extends Auditable> Map<String, Object> toValues(Class<E> entityClass, E entity) {
		Map<String, Object> values = new LinkedHashMap<>();
		if (entity instanceof RoleEntity e) {
			values.put("name", e.getName());
			values.put("description", e.getDescription());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof UserEntity e) {
			values.put("firstName", e.getFirstName());
			values.put("lastName", e.getLastName());
			values.put("email", e.getEmail());
			values.put("passwordHash", e.getPasswordHash());
			values.put("active", e.isActive());
			values.put("roleId", idOf(e.getRole()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof LogbookEntity e) {
			values.put("code", e.getCode());
			values.put("name", e.getName());
			values.put("description", e.getDescription());
			values.put("maxEntries", e.getMaxEntries());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof FolioBlockEntity e) {
			values.put("identifier", e.getIdentifier());
			values.put("startNumber", e.getStartNumber());
			values.put("endNumber", e.getEndNumber());
			values.put("coverGenerated", e.isCoverGenerated());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof FolioEntity e) {
			values.put("folioBlockId", idOf(e.getFolioBlock()));
			values.put("logbookId", idOf(e.getLogbook()));
			values.put("folioNumber", e.getFolioNumber());
			values.put("status", e.getStatus());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryEntity e) {
			values.put("folioId", idOf(e.getFolio()));
			values.put("logbookId", idOf(e.getLogbook()));
			values.put("userId", idOf(e.getUser()));
			values.put("recordedAt", e.getRecordedAt());
			values.put("status", e.getStatus());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof AlertEntity e) {
			values.put("type", e.getType());
			values.put("message", e.getMessage());
			values.put("generatedAt", e.getGeneratedAt());
			values.put("targetUserId", idOf(e.getTargetUser()));
			values.put("status", e.getStatus());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof SignatureEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			values.put("signedAt", e.getSignedAt());
			values.put("signatureType", e.getSignatureType());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof ReagentEntity e) {
			values.put("name", e.getName());
			values.put("chemicalFormula", e.getChemicalFormula());
			values.put("unit", e.getUnit());
			values.put("totalStock", e.getTotalStock());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof BatchEntity e) {
			values.put("batchCode", e.getBatchCode());
			values.put("reagentId", idOf(e.getReagent()));
			values.put("generatedAt", e.getGeneratedAt());
			values.put("startDate", e.getStartDate());
			values.put("endDate", e.getEndDate());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof ReagentJarEntity e) {
			values.put("reagentId", idOf(e.getReagent()));
			values.put("initialAmountG", e.getInitialAmountG());
			values.put("currentAmountG", e.getCurrentAmountG());
			values.put("openedAt", e.getOpenedAt());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof SolutionEntity e) {
			values.put("name", e.getName());
			values.put("concentration", e.getConcentration());
			values.put("quantity", e.getQuantity());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof SupplyEntity e) {
			values.put("name", e.getName());
			values.put("availableQty", e.getAvailableQty());
			values.put("unit", e.getUnit());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryConductivityEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("type", e.getType());
			values.put("measuredValue", e.getMeasuredValue());
			values.put("weightGrams", e.getWeightGrams());
			values.put("calculatedMol", e.getCalculatedMol());
			values.put("calculatedValue", e.getCalculatedValue());
			values.put("inRange", e.getInRange());
			values.put("autoDate", e.getAutoDate());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryDistilledWaterEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("phReading1", e.getPhReading1());
			values.put("phReading2", e.getPhReading2());
			values.put("phReading3", e.getPhReading3());
			values.put("phAverage", e.getPhAverage());
			values.put("ceReading1", e.getCeReading1());
			values.put("ceReading2", e.getCeReading2());
			values.put("ceReading3", e.getCeReading3());
			values.put("ceAverage", e.getCeAverage());
			values.put("referenceDifference", e.getReferenceDifference());
			values.put("controlStandardPct", e.getControlStandardPct());
			values.put("isAcceptable", e.getIsAcceptable());
			values.put("waterBatchId", idOf(e.getWaterBatch()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryOvenTempEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("rawTemperature", e.getRawTemperature());
			values.put("correctedTemperature", e.getCorrectedTemperature());
			values.put("readingNumber", e.getReadingNumber());
			values.put("recordedAt", e.getRecordedAt());
			values.put("inRange", e.getInRange());
			values.put("isMaintenance", e.getIsMaintenance());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryWeighingEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("reagentId", idOf(e.getReagent()));
			values.put("weightGrams", e.getWeightGrams());
			values.put("targetSolutionId", idOf(e.getTargetSolution()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryMaterialWashEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("mondayDate", e.getMondayDate());
			values.put("pieceType", e.getPieceType());
			values.put("material", e.getMaterial());
			values.put("determination", e.getDetermination());
			values.put("color", e.getColor());
			values.put("analystUserId", idOf(e.getAnalystUser()));
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntrySolutionPrepEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("solutionId", idOf(e.getSolution()));
			values.put("weighingEntryId", idOf(e.getWeighingEntry()));
			values.put("analystUserId", idOf(e.getAnalystUser()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryDryingOvenEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("reagentId", idOf(e.getReagent()));
			values.put("entryTime", e.getEntryTime());
			values.put("exitTime", e.getExitTime());
			values.put("analystUserId", idOf(e.getAnalystUser()));
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			values.put("meetsTemp", e.getMeetsTemp());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryAccuracyEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("samplerUserId", idOf(e.getSamplerUser()));
			values.put("batch1Avg", e.getBatch1Avg());
			values.put("batch2Avg", e.getBatch2Avg());
			values.put("difference", e.getDifference());
			values.put("inRange", e.getInRange());
			values.put("phLogbookId", idOf(e.getPhLogbook()));
			values.put("phFolioNumber", e.getPhFolioNumber());
			values.put("dailyRecordDate", e.getDailyRecordDate());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryExpenseChartEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("employmentDate", e.getEmploymentDate());
			values.put("endDate", e.getEndDate());
			values.put("equipmentKey", e.getEquipmentKey());
			values.put("distilledWaterQty", e.getDistilledWaterQty());
			values.put("waterType", e.getWaterType());
			values.put("batchId", idOf(e.getBatch()));
			values.put("kclJarId", idOf(e.getKclJar()));
			values.put("kclUsedG", e.getKclUsedG());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryFlaskTreatmentEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("washEntryId", idOf(e.getWashEntry()));
			values.put("swabSupplyId", idOf(e.getSwabSupply()));
			values.put("swabsUsed", e.getSwabsUsed());
			values.put("analysisValue", e.getAnalysisValue());
			values.put("cmcResult", e.getCmcResult());
			values.put("reportDate", e.getReportDate());
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			putAudit(values, e);
			return values;
		}
		throw new IllegalArgumentException("Unsupported entity for CRUD mapping: " + entityClass.getSimpleName());
	}

	private static void applyAudit(Auditable entity, Map<String, Object> values, EntityManager entityManager) {
		if (values.containsKey("createdByUserId")) {
			entity.setCreatedByUser(requireActive(entityManager, UserEntity.class, values.get("createdByUserId")));
		}
		if (values.containsKey("updatedByUserId")) {
			entity.setUpdatedByUser(requireActive(entityManager, UserEntity.class, values.get("updatedByUserId")));
		}
		if (values.containsKey("deletedByUserId")) {
			entity.setDeletedByUser(requireActive(entityManager, UserEntity.class, values.get("deletedByUserId")));
		}
	}

	private static void putAudit(Map<String, Object> values, Auditable entity) {
		values.put("createdAt", entity.getCreatedAt());
		values.put("updatedAt", entity.getUpdatedAt());
		values.put("deletedAt", entity.getDeletedAt());
		values.put("createdByUserId", idOf(entity.getCreatedByUser()));
		values.put("updatedByUserId", idOf(entity.getUpdatedByUser()));
		values.put("deletedByUserId", idOf(entity.getDeletedByUser()));
	}

	private static <R extends Auditable> R requireActive(EntityManager entityManager, Class<R> relationClass, Object rawId) {
		Long id = CrudValueHelper.asLong(rawId);
		if (id == null) {
			return null;
		}
		R relation = entityManager.find(relationClass, id);
		if (relation == null || relation.getDeletedAt() != null) {
			throw new IllegalArgumentException("Related entity not found: " + relationClass.getSimpleName() + " id=" + id);
		}
		return relation;
	}

	private static Long idOf(Auditable relation) {
		if (relation == null) {
			return null;
		}
		if (relation instanceof RoleEntity e) return e.getId();
		if (relation instanceof UserEntity e) return e.getId();
		if (relation instanceof LogbookEntity e) return e.getId();
		if (relation instanceof FolioBlockEntity e) return e.getId();
		if (relation instanceof FolioEntity e) return e.getId();
		if (relation instanceof EntryEntity e) return e.getId();
		if (relation instanceof AlertEntity e) return e.getId();
		if (relation instanceof SignatureEntity e) return e.getId();
		if (relation instanceof ReagentEntity e) return e.getId();
		if (relation instanceof BatchEntity e) return e.getId();
		if (relation instanceof ReagentJarEntity e) return e.getId();
		if (relation instanceof SolutionEntity e) return e.getId();
		if (relation instanceof SupplyEntity e) return e.getId();
		if (relation instanceof EntryConductivityEntity e) return e.getId();
		if (relation instanceof EntryDistilledWaterEntity e) return e.getId();
		if (relation instanceof EntryOvenTempEntity e) return e.getId();
		if (relation instanceof EntryWeighingEntity e) return e.getId();
		if (relation instanceof EntryMaterialWashEntity e) return e.getId();
		if (relation instanceof EntrySolutionPrepEntity e) return e.getId();
		if (relation instanceof EntryDryingOvenEntity e) return e.getId();
		if (relation instanceof EntryAccuracyEntity e) return e.getId();
		if (relation instanceof EntryExpenseChartEntity e) return e.getId();
		if (relation instanceof EntryFlaskTreatmentEntity e) return e.getId();
		return null;
	}
}
```

<!-- ANEXO_CRUD_ENTITY_MAPPER_END -->

---

## 8. Anexo B — `LaboratoryInitializationService.java` (contenido completo)

*Archivo:* `ccasaBackend/src/main/java/com/backend/ccasa/config/LaboratoryInitializationService.java`

```java
package com.backend.ccasa.config;

import com.backend.ccasa.persistence.entities.LaboratoryEquipmentEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.ReferenceParameterEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.repositories.LaboratoryEquipmentRepository;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.persistence.repositories.ReferenceParameterRepository;
import com.backend.ccasa.persistence.repositories.SolutionRepository;
import com.backend.ccasa.service.impl.support.ReferenceParameterCodes;
import com.backend.ccasa.service.impl.support.ReferenceParameterDefaults;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inicialización de datos por defecto del laboratorio (patrón análogo a CompanyInitializationService en Gama).
 * Idempotente: bitácoras por código 1–15; parámetros por {@code code}; soluciones por nombre+concentración; equipos por denominación.
 */
@Service
public class LaboratoryInitializationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(LaboratoryInitializationService.class);

	private static final int LOGBOOK_CODE_MIN = 1;
	private static final int LOGBOOK_CODE_MAX = 15;

	private final LogbookRepository logbookRepository;
	private final ReferenceParameterRepository referenceParameterRepository;
	private final SolutionRepository solutionRepository;
	private final LaboratoryEquipmentRepository laboratoryEquipmentRepository;

	public LaboratoryInitializationService(
		LogbookRepository logbookRepository,
		ReferenceParameterRepository referenceParameterRepository,
		SolutionRepository solutionRepository,
		LaboratoryEquipmentRepository laboratoryEquipmentRepository
	) {
		this.logbookRepository = logbookRepository;
		this.referenceParameterRepository = referenceParameterRepository;
		this.solutionRepository = solutionRepository;
		this.laboratoryEquipmentRepository = laboratoryEquipmentRepository;
	}

	/**
	 * Carga inicial en despliegue single-tenant: 15 bitácoras (UI-01), parámetros RF, textos de reglas,
	 * catálogo de soluciones y equipos.
	 */
	@Transactional
	public void ensureDefaultLaboratoryData() {
		logAndSeedDefaultCatalog();
	}

	/**
	 * Punto de enganche cuando exista entidad de laboratorio/empresa y datos por tenant.
	 * Hoy el esquema es single-tenant (sin FK {@code laboratory_id} en parámetros); se aplica el mismo seed global.
	 * Tras añadir multi-tenant, invocar este método tras persistir el laboratorio (como CompanyServiceImpl en Gama).
	 *
	 * @param laboratoryId identificador del laboratorio; puede ser null (mismo comportamiento que {@link #ensureDefaultLaboratoryData()})
	 */
	@Transactional
	public void initializeLaboratoryData(Long laboratoryId) {
		if (laboratoryId != null) {
			LOGGER.info(
				"initializeLaboratoryData(laboratoryId={}): multi-tenant por laboratorio aún no modelado en BD; aplicando seed global",
				laboratoryId
			);
		}
		logAndSeedDefaultCatalog();
	}

	private void logAndSeedDefaultCatalog() {
		LOGGER.info("Inicializando datos por defecto del laboratorio (single-tenant)");
		seedDefaultCatalogData();
		LOGGER.info("Inicialización de datos por defecto del laboratorio completada");
	}

	private void seedDefaultCatalogData() {
		ensureLogbooksForCodesInRange();
		upsertReferenceParametersAndFormulaDefinitions();
		initializeSolutionsFromList();
		initializeEquipmentFromList();
	}

	/**
	 * Idempotencia por código: crea cada bitácora 1..15 solo si no existe fila activa con ese {@code code}
	 * (evita duplicados si la BD quedó a medias o se borró parte del catálogo).
	 */
	private void ensureLogbooksForCodesInRange() {
		LOGGER.info("Asegurando bitácoras códigos {}..{} (idempotente por código)", LOGBOOK_CODE_MIN, LOGBOOK_CODE_MAX);
		int created = 0;
		for (int code = LOGBOOK_CODE_MIN; code <= LOGBOOK_CODE_MAX; code++) {
			if (logbookRepository.findByCodeAndDeletedAtIsNull(code).isPresent()) {
				continue;
			}
			LogbookEntity l = new LogbookEntity();
			l.setCode(code);
			l.setName("Bitácora " + code);
			l.setDescription("Bitácora de laboratorio código " + code);
			l.setMaxEntries(200);
			logbookRepository.save(l);
			created++;
		}
		LOGGER.info("Bitácoras: {} creadas; resto ya existían o catálogo completo", created);
	}

	/**
	 * Límites numéricos RF y filas solo documentales (FORMULA_*) con min/max null.
	 */
	private void upsertReferenceParametersAndFormulaDefinitions() {
		LOGGER.info("Asegurando parámetros de referencia y definiciones de fórmulas (idempotente)");
		ensureRef(
			ReferenceParameterCodes.RF05_CONDUCTIVITY_HIGH,
			ReferenceParameterDefaults.RF05_HIGH_MIN,
			ReferenceParameterDefaults.RF05_HIGH_MAX,
			"RF-05 conductividad alta (rango de referencia)",
			"RF-05: el valor evaluado (calculado o, si no existe, medido) debe estar entre min y max para tipo Alta. "
				+ "Ver FORMULA_RF05_CONDUCTIVITY_IN_RANGE."
		);
		ensureRef(
			ReferenceParameterCodes.RF05_CONDUCTIVITY_LOW,
			ReferenceParameterDefaults.RF05_LOW_MIN,
			ReferenceParameterDefaults.RF05_LOW_MAX,
			"RF-05 conductividad baja (rango de referencia)",
			"RF-05: el valor evaluado (calculado o, si no existe, medido) debe estar entre min y max para tipo Baja. "
				+ "Ver FORMULA_RF05_CONDUCTIVITY_IN_RANGE."
		);
		ensureRef(
			ReferenceParameterCodes.RF06_OVEN_CORRECTED_TEMP,
			ReferenceParameterDefaults.RF06_OVEN_MIN,
			ReferenceParameterDefaults.RF06_OVEN_MAX,
			"RF-06 temperatura corregida horno (grados C, rango aceptable)",
			"RF-06: temperatura corregida = lectura bruta − 1 °C. El rango aceptable de la corregida está dado por min/max. "
				+ "Ver FORMULA_RF06_OVEN_CORRECTED."
		);
		ensureRef(
			ReferenceParameterCodes.ACCURACY_MAX_ABS_DIFFERENCE,
			null,
			ReferenceParameterDefaults.ACCURACY_MAX_ABS_DIFF,
			"Tolerancia máxima |promedio lote1 − promedio lote2| (referencia cruzada)",
			"Se compara la diferencia absoluta entre promedios de dos lotes con el máximo permitido (max_value). "
				+ "Ver FORMULA_ACCURACY_DIFF."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF08_PH_AVG,
			"RF-08 agua destilada: promedio pH",
			"Promedio pH = (lectura1 + lectura2 + lectura3) / 3, redondeo HALF_UP a 3 decimales."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF08_CE_AVG,
			"RF-08 agua destilada: promedio conductividad eléctrica (CE)",
			"Promedio CE = (lectura1 + lectura2 + lectura3) / 3, redondeo HALF_UP a 4 decimales."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF08_ACCEPTABLE,
			"RF-08 agua destilada: criterio aceptable",
			"Si referenceDifference ≥ 0 y controlStandardPct ≤ 100, la muestra se considera aceptable (is_acceptable)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_CONDUCTIVITY_IN_RANGE,
			"RF-05 conductividad: en rango",
			"Se toma valor = calculatedValue si existe; si no, measuredValue. in_range = (min ≤ valor ≤ max) según tipo Alto/Bajo."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF06_OVEN_CORRECTED,
			"RF-06 horno: temperatura corregida y en rango",
			"correctedTemperature = rawTemperature − 1. in_range = (min ≤ corrected ≤ max) usando parámetros RF06."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_ACCURACY_DIFF,
			"Precisión / referencia cruzada: diferencia entre lotes",
			"difference = |batch1Avg − batch2Avg|. in_range = (difference ≤ tolerancia en ACCURACY_MAX_ABS_DIFFERENCE.max_value)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_EXPENSE_KCL_JAR,
			"Carta de gastos: consumo de KCl desde frasco",
			"Al crear/actualizar/borrar, se descuenta o revierte la cantidad usada (kclUsedG) del frasco de reactivo asociado, con validación de saldo."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_SOLUTION_PREP_WEIGHING,
			"Preparación de solución: vínculo con pesada",
			"La entrada de pesada asociada debe pertenecer a la misma entrada (entry) que la preparación de solución."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_KCL_HIGH_PREP_CHAIN,
			"20-108 conductividad alta: cadena Excel (hoja YYYYMMDD), preparación estándar KCl",
			"Por hoja-fecha hay dos bloques con la misma estructura. Bloque 1: C26=C25*B24/C24; E24=C26; E25=B10; "
				+ "F26=(E25*F24)/E24; D29=F26; F30=(D29*F28)/D28; B13=F30. Bloque 2: C56=C55*B54/C54; E54=C56; E55=B40; "
				+ "F56=(E55*F54)/E54; D59=F56; F60=(D59*F58)/D58; B43=F60. "
				+ "Constantes sembradas: KCL_HIGH_C25..F28 (ver conductivity_high_20_108_constants.json). "
				+ "Peso (g) en API: weightGrams; mol calculado en calculatedMol; conductividad teórica (µS/cm) en calculatedValue."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_C25,
			ReferenceParameterDefaults.KCL_HIGH_C25,
			"20-108: celda C25 (constante ref. peso/molaridad paso 1)",
			"Valor escalar para C26=C25*B24/C24."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_B24,
			ReferenceParameterDefaults.KCL_HIGH_B24,
			"20-108: celda B24",
			"Factor en regla de tres paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_C24,
			ReferenceParameterDefaults.KCL_HIGH_C24,
			"20-108: celda C24",
			"Denominador paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_F24,
			ReferenceParameterDefaults.KCL_HIGH_F24,
			"20-108: celda F24",
			"Referencia mol en paso F26=(E25*F24)/E24."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_D28,
			ReferenceParameterDefaults.KCL_HIGH_D28,
			"20-108: celda D28",
			"Denominador en F30=(D29*F28)/D28."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_F28,
			ReferenceParameterDefaults.KCL_HIGH_F28,
			"20-108: celda F28",
			"Conductividad patrón (µS/cm) en paso final."
		);
		ensureRef(
			ReferenceParameterCodes.KCL_HIGH_THEORETICAL_U_CM,
			ReferenceParameterDefaults.KCL_HIGH_THEORY_MIN_U_CM,
			ReferenceParameterDefaults.KCL_HIGH_THEORY_MAX_U_CM,
			"20-108: rango aceptación conductividad teórica (µS/cm) con weightGrams",
			"Cuando type=High y weightGrams está informado, in_range compara calculatedValue (µS/cm) con este rango; "
				+ "no es el RF05 mS/cm de lectura directa (RF05_CONDUCTIVITY_HIGH)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_KCL_LOW_PREP_CHAIN,
			"3-CONDUCTIVIDAD BAJA (excel_formulas.json: 3-CONDUCTIVIDAD_BAJA_20-108-01_--CONDUCTIVIDAD_BAJAS.xlsx): hojas YYYYMMDD",
			"Misma topología que conductividad alta: C26=C25*B24/C24; E24=C26; E25=B10; F26=(E25*F24)/E24; D29=F26; "
				+ "F30=(D29*F28)/D28; B13=F30. Bloque 2: C56=C55*B54/C54; E54=C56; E55=B40; F56=(E55*F54)/E54; D59=F56; "
				+ "F60=(D59*F58)/D58; B43=F60. Ver FORMULA_RF05_KCL_HIGH_PREP_CHAIN (equivalente). "
				+ "Constantes KCL_LOW_* en conductivity_low_20_108_constants.json."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_CB_BD_MCF_ADJUST,
			"3-CONDUCTIVIDAD BAJA BCN (ej. 20-111-01-_--CONDUCTIVIDAD_BAJA_BCN.xlsx): hoja BD",
			"B2=TEXT(Tabla1[[#This Row],[Fecha]],\"DDDD\"); I2=Tabla611[[#This Row],[MCF]]-0.0015 (patrón repetido en filas siguientes). "
				+ "Fuente: excel_formulas.json."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_GASTOS_CE_BD_RANDOM,
			"4 Y 5-GASTOS CE (Carta_de_gastos_conductividad.xlsx): hoja BD",
			"D* = RAND()*(Tabla1[[#This Row],[SUP]]-Tabla1[[#This Row],[INF]])+Tabla1[[#This Row],[INF]]. "
				+ "La API no reproduce RAND(); el negocio de gastos KCl usa otras reglas (ver FORMULA_EXPENSE_KCL_JAR)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_GASTOS_CE_VALOR_LEFT6,
			"4 Y 5-GASTOS CE: columna E en BD",
			"E* = LEFT(Tabla1[[#This Row],[VALOR]],6)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_GASTOS_PH_DISOLUCION_ACCUM,
			"4 Y 5-GASTOS pH (Carta_de_gastos_pH.xlsx): hojas DISOLUCION",
			"Ej. DISOLUCION DE 7,00: C21=G18-B21; C22=C21-B22; C23=C22-B23; … (acumulado restando columna B). Fuente: excel_formulas.json."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_CARTA_HORNO_MES_ENLACE,
			"6-CARTA CONTROL HORNO DE SECADO (Control_de_temperatura_horno_2024-2025.xlsx)",
			"En hojas mensuales con fórmulas: AO40=mes; A71=Y44 (ej. MARZO 2025, ABRIL 2025). Otras hojas sin fórmulas en el extracto."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MHS_FOLIO15_SECUENCIA,
			"11-M-HS-01 (M-HS-01 Uso horno de secado.xlsx): hoja FOLIO 15-200",
			"A12=A11+1; B12=B11; C12=C11; A13=A12+1; B13=B12; C13=C12; … (secuencia de folio y columnas B/C)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MLM_SEMANA_MAS7,
			"12-M-LM-01 (Lavado de material.xlsx): folios con fórmulas",
			"Ej. FOLIO 6: A12=A10+7; A14=A12+7; A16=A14+7; … (incrementos de 7 en columna A)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MSOL_MACHOTE_FOLIO,
			"14-M-SOL-01 (PREPARACION DE SOLUCIONES..xlsx): hoja MACHOTE",
			"L6=E6+1; E44=L6+1; L44=E44+1; E84=L44+1; L84=E84+1; E121=L84+1; L121=E121+1; E157=L121+1; L157=E157+1."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MSOL_FECHA_BLOQUE,
			"14-M-SOL-01: hojas por fecha (ej. 2024-01-02)",
			"I6=B6; L6=E6+1; B44=B6; E44=L6+1; I44=B6; L44=E44+1; B84=B6; E84=L44+1; … propagación de bloques."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MSOL_02_BD_INDEX,
			"14-M-SOL-02 (PREPARACION DE SOLUCIONES..xlsx): hoja BD",
			"Fórmulas con INDEX/MATCH y tablas (Tabla111, Tabla312, Tabla413, Tabla514, etc.) para textos compuestos (lotes, bitácoras). "
				+ "Listado completo en excel_formulas.json bajo clave 14-PREPARACION_SOLUCIONES_M-SOL_M-SOL-_02_…"
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_C25,
			ReferenceParameterDefaults.KCL_LOW_C25,
			"20-108-01 CB: celda C25",
			"Escalar cadena KCl baja; ver conductivity_low_20_108_constants.json."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_B24,
			ReferenceParameterDefaults.KCL_LOW_B24,
			"20-108-01 CB: celda B24",
			"Factor paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_C24,
			ReferenceParameterDefaults.KCL_LOW_C24,
			"20-108-01 CB: celda C24",
			"Denominador paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_F24,
			ReferenceParameterDefaults.KCL_LOW_F24,
			"20-108-01 CB: celda F24",
			"Referencia mol F26."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_D28,
			ReferenceParameterDefaults.KCL_LOW_D28,
			"20-108-01 CB: celda D28",
			"Denominador F30."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_F28,
			ReferenceParameterDefaults.KCL_LOW_F28,
			"20-108-01 CB: celda F28",
			"Conductividad patrón (µS/cm)."
		);
		ensureRef(
			ReferenceParameterCodes.KCL_LOW_THEORETICAL_U_CM,
			ReferenceParameterDefaults.KCL_LOW_THEORY_MIN_U_CM,
			ReferenceParameterDefaults.KCL_LOW_THEORY_MAX_U_CM,
			"Conductividad baja: rango aceptación conductividad teórica (µS/cm) con weightGrams",
			"Cuando type=Low y weightGrams está informado, in_range compara calculatedValue (µS/cm) con este rango; "
				+ "no es el RF05 mS/cm de lectura directa (RF05_CONDUCTIVITY_LOW)."
		);
		LOGGER.info("Parámetros y definiciones de fórmulas actualizados");
	}

	private void ensureScalarRef(String code, BigDecimal value, String description, String ruleDetail) {
		ensureRef(code, value, value, description, ruleDetail);
	}

	private void ensureRef(String code, BigDecimal min, BigDecimal max, String description, String ruleDetail) {
		if (isBlank(code)) {
			LOGGER.warn("ensureRef omitido: código vacío");
			return;
		}
		if (isBlank(description) || isBlank(ruleDetail)) {
			LOGGER.warn("ensureRef omitido para código {}: descripción o rule_detail vacíos", code);
			return;
		}
		if (min != null && max != null && min.compareTo(max) > 0) {
			LOGGER.warn(
				"ensureRef omitido para código {}: min_value ({}) > max_value ({})",
				code,
				min,
				max
			);
			return;
		}
		ReferenceParameterEntity e = referenceParameterRepository.findByCodeAndDeletedAtIsNull(code).orElseGet(() -> {
			ReferenceParameterEntity n = new ReferenceParameterEntity();
			n.setCode(code);
			return n;
		});
		e.setMinValue(min);
		e.setMaxValue(max);
		e.setDescription(description);
		e.setRuleDetail(ruleDetail);
		referenceParameterRepository.save(e);
	}

	private void ensureFormulaRow(String code, String description, String ruleDetail) {
		if (isBlank(code)) {
			LOGGER.warn("ensureFormulaRow omitido: código vacío");
			return;
		}
		if (isBlank(description) || isBlank(ruleDetail)) {
			LOGGER.warn("ensureFormulaRow omitido para código {}: descripción o rule_detail vacíos", code);
			return;
		}
		ReferenceParameterEntity e = referenceParameterRepository.findByCodeAndDeletedAtIsNull(code).orElseGet(() -> {
			ReferenceParameterEntity n = new ReferenceParameterEntity();
			n.setCode(code);
			return n;
		});
		e.setMinValue(null);
		e.setMaxValue(null);
		e.setDescription(description);
		e.setRuleDetail(ruleDetail);
		referenceParameterRepository.save(e);
	}

	private void initializeSolutionsFromList() {
		LOGGER.info("Asegurando catálogo de soluciones (reactivos) desde listado inicial");
		int added = 0;
		int skipped = 0;
		for (InitialCatalogData.SolutionSeed seed : InitialCatalogData.SOLUTIONS) {
			String name = seed.name() == null ? "" : seed.name().trim();
			if (name.isEmpty()) {
				LOGGER.warn("Fila de solución omitida: nombre vacío");
				skipped++;
				continue;
			}
			String conc = normalizeConcentration(seed.concentration());
			String concKey = conc.isEmpty() ? null : conc;
			if (solutionRepository.findByNameAndConcentrationAndDeletedAtIsNull(name, concKey).isPresent()) {
				continue;
			}
			SolutionEntity s = new SolutionEntity();
			s.setName(name);
			s.setConcentration(concKey);
			solutionRepository.save(s);
			added++;
		}
		LOGGER.info("Soluciones: {} nuevas; {} filas inválidas omitidas; listado {}", added, skipped, InitialCatalogData.SOLUTIONS.size());
	}

	private static String normalizeConcentration(String concentration) {
		if (concentration == null) {
			return "";
		}
		return concentration.trim();
	}

	private void initializeEquipmentFromList() {
		LOGGER.info("Asegurando catálogo de equipos desde listado inicial");
		int added = 0;
		int skipped = 0;
		for (InitialCatalogData.EquipmentSeed seed : InitialCatalogData.EQUIPMENT) {
			String type = seed.equipmentType() == null ? "" : seed.equipmentType().trim();
			String denom = seed.denomination() == null ? "" : seed.denomination().trim();
			if (type.isEmpty() || denom.isEmpty()) {
				LOGGER.warn("Fila de equipo omitida: tipo o denominación vacíos");
				skipped++;
				continue;
			}
			if (laboratoryEquipmentRepository.findByDenominationAndDeletedAtIsNull(denom).isPresent()) {
				continue;
			}
			LaboratoryEquipmentEntity e = new LaboratoryEquipmentEntity();
			e.setEquipmentType(type);
			e.setDenomination(denom);
			laboratoryEquipmentRepository.save(e);
			added++;
		}
		LOGGER.info("Equipos: {} nuevos; {} filas inválidas omitidas; listado {}", added, skipped, InitialCatalogData.EQUIPMENT.size());
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}
```

---

## 9. Nota

Si el Javadoc de `EntryConductivityEntity` muestra caracteres corruptos en rangos RF-05 (encoding), conviene corregir el archivo fuente a UTF-8 válido.

