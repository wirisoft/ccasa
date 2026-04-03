# ccasaBackend — CRUD genérico, bitácoras y DTOs (resumen para IA)

Análisis del backend **ccasaBackend**: DTOs `CrudRequestDTO` / `CrudResponseDTO`, `LogbookController`, `LogbookCrudService`, `LogbookDTO`, `LogbookEntity`, y la base de servicio CRUD (`AbstractEntityCrudService`). Incluye nota sobre la inexistencia de `AbstractCrudController` y un controlador CRUD de referencia (`BatchCrudController`).

---

## Columnas de la tabla `logbook`

Definidas por `LogbookEntity` + `Auditable` en la tabla `logbook`:

| Columna (BD) | Origen |
|--------------|--------|
| `logbook_id` | PK (`LogbookEntity`) |
| `code` | Código único |
| `name` | Nombre |
| `description` | Descripción (TEXT) |
| `max_entries` | Máximo de entradas |
| `created_at` | Auditoría (`Auditable`) |
| `updated_at` | Auditoría |
| `deleted_at` | Soft delete |
| `created_by_user_id` | FK a usuario |
| `updated_by_user_id` | FK a usuario |
| `deleted_by_user_id` | FK a usuario |

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/CrudRequestDTO.java`

```java
package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.util.Map;

public record CrudRequestDTO(Map<String, Object> values) implements Serializable {
}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/CrudResponseDTO.java`

```java
package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.util.Map;

public record CrudResponseDTO(Long id, Map<String, Object> values) implements Serializable {
}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/controllers/LogbookController.java`

```java
package com.backend.ccasa.controllers;

import com.backend.ccasa.service.ILogbookService;
import com.backend.ccasa.service.impl.LogbookCrudService;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import com.backend.ccasa.service.models.dtos.LogbookDTO;
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

/**
 * API de bitÃ¡coras (UI-01: dashboard 15 bitÃ¡coras).
 */
@RestController
@RequestMapping("/api/v1/logbooks")
public class LogbookController {

	private final ILogbookService logbookService;
	private final LogbookCrudService logbookCrudService;

	public LogbookController(ILogbookService logbookService, LogbookCrudService logbookCrudService) {
		this.logbookService = logbookService;
		this.logbookCrudService = logbookCrudService;
	}

	@GetMapping
	public ResponseEntity<List<LogbookDTO>> list() {
		return ResponseEntity.ok(logbookService.findAllActive());
	}

	@GetMapping("/{id}")
	public ResponseEntity<LogbookDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(logbookService.getById(id));
	}

	@PostMapping
	public ResponseEntity<CrudResponseDTO> create(@RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(logbookCrudService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<CrudResponseDTO> update(@PathVariable Long id, @RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(logbookCrudService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		logbookCrudService.delete(id);
		return ResponseEntity.noContent().build();
	}
}

```

**Nota:** En el archivo fuente, algunos comentarios pueden verse como `bitÃ¡coras` por codificación; en UTF-8 correcto sería «bitácoras».

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/impl/LogbookCrudService.java`

```java
package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.service.ILogbookCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class LogbookCrudService extends AbstractEntityCrudService<LogbookEntity> implements ILogbookCrudService {

	public LogbookCrudService(LogbookRepository repository, EntityManager entityManager) {
		super(repository, entityManager, LogbookEntity.class, "L_OG_BO_OK");
	}

	@Override
	protected LogbookEntity newEntity() {
		return new LogbookEntity();
	}
}
```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/LogbookDTO.java`

```java
package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;

/**
 * DTO para bitÃ¡cora (UI-01 dashboard).
 */
public record LogbookDTO(Long id, Integer code, String name, String description, Integer maxEntries) implements Serializable {}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/persistence/entities/LogbookEntity.java`

```java
package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Bitácora (UI-01: 15 registros code 1–15).
 */
@Entity
@Table(name = "logbook")
public class LogbookEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "logbook_id")
	private Long id;

	@Column(name = "code", nullable = false, unique = true)
	private Integer code;

	@Column(name = "name", nullable = false, length = 150)
	private String name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "max_entries")
	private Integer maxEntries;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Integer getCode() { return code; }
	public void setCode(Integer code) { this.code = code; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public Integer getMaxEntries() { return maxEntries; }
	public void setMaxEntries(Integer maxEntries) { this.maxEntries = maxEntries; }
}
```

---

## Sobre `AbstractCrudController.java`

**No existe en el repositorio.** El patrón REST se repite en cada `*CrudController` bajo `controllers/crud/` (misma firma de métodos). La lógica CRUD genérica compartida está en **`AbstractEntityCrudService`** (servicio).

Abajo: clase base de servicio completa y un controlador CRUD de ejemplo (`BatchCrudController`).

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/impl/AbstractEntityCrudService.java`

```java
package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.persistence.repositories.ActiveRepository;
import com.backend.ccasa.service.ITypedCrudService;
import com.backend.ccasa.service.impl.support.CrudEntityMapper;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public abstract class AbstractEntityCrudService<E extends Auditable> implements ITypedCrudService {

	private final ActiveRepository<E, Long> repository;
	private final EntityManager entityManager;
	private final Class<E> entityClass;
	private final String resourceCode;

	protected AbstractEntityCrudService(
		ActiveRepository<E, Long> repository,
		EntityManager entityManager,
		Class<E> entityClass,
		String resourceCode
	) {
		this.repository = repository;
		this.entityManager = entityManager;
		this.entityClass = entityClass;
		this.resourceCode = toResourceCode(entityClass);
	}

	protected abstract E newEntity();

	@Override
	public CrudResponseDTO create(CrudRequestDTO request) {
		E entity = newEntity();
		CrudEntityMapper.apply(entityClass, entity, values(request), entityManager);
		E saved = repository.save(entity);
		return toDto(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CrudResponseDTO> findAllActive() {
		return repository.findAllByDeletedAtIsNull().stream().map(this::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public CrudResponseDTO findById(Long id) {
		return toDto(requireActive(id));
	}

	@Override
	public CrudResponseDTO update(Long id, CrudRequestDTO request) {
		E entity = requireActive(id);
		CrudEntityMapper.apply(entityClass, entity, values(request), entityManager);
		entity.setUpdatedAt(Instant.now());
		E saved = repository.save(entity);
		return toDto(saved);
	}

	@Override
	public void delete(Long id) {
		E entity = requireActive(id);
		entity.setDeletedAt(Instant.now());
		repository.save(entity);
	}

	private E requireActive(Long id) {
		return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException(resourceCode, id));
	}

	private CrudResponseDTO toDto(E entity) {
		return new CrudResponseDTO(extractId(entity), CrudEntityMapper.toValues(entityClass, entity));
	}

	private Long extractId(E entity) {
		if (entity instanceof com.backend.ccasa.persistence.entities.RoleEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.UserEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.LogbookEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.FolioBlockEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.FolioEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.EntryEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.AlertEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.SignatureEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.ReagentEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.BatchEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.ReagentJarEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.SolutionEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.SupplyEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryDryingOvenEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryFlaskTreatmentEntity e) return e.getId();
		return null;
	}

	private Map<String, Object> values(CrudRequestDTO request) {
		return request == null || request.values() == null ? Map.of() : request.values();
	}

	private String toResourceCode(Class<E> type) {
		String base = type.getSimpleName().replace("Entity", "");
		return base.replaceAll("([a-z])([A-Z])", "$1_$2").toUpperCase();
	}
}
```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/controllers/crud/BatchCrudController.java` (patrón de controlador CRUD repetido)

```java
package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.service.IBatchCrudService;
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
@RequestMapping("/api/v1/batches")
public class BatchCrudController {

	private final IBatchCrudService service;

	public BatchCrudController(IBatchCrudService service) {
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
