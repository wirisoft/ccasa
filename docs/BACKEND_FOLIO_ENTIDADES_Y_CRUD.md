# Backend: Folio y FolioBlock — entidades JPA y controladores CRUD

Referencia extraída del código en `ccasaBackend` (paquete `com.backend.ccasa`).

---

## Preguntas frecuentes

### ¿Hay algún DTO específico de Folio aparte de `CrudResponseDTO`?

No. En `com.backend.ccasa.service.models.dtos` no existe `FolioDTO` ni otro DTO con “Folio” en el nombre. Los DTO en ese paquete incluyen `CrudRequestDTO`, `CrudResponseDTO`, `LogbookDTO`, `EntrySummaryDTO`, DTOs de auth y de agua destilada. El CRUD de folios y bloques usa `CrudRequestDTO` / `CrudResponseDTO`. Lo relacionado con el dominio de folios en modelo de API incluye el enum `FolioStatusEnum` (`service.models.enums`), no un DTO dedicado a folio.

### ¿`FolioEntity` tiene relación con `LogbookEntity` o con `FolioBlockEntity`?

Sí, con **ambos**:

| Relación | Tipo JPA | Columna FK | Obligatorio |
|----------|-----------|------------|-------------|
| Con `FolioBlockEntity` | `@ManyToOne` | `folio_block_id` | `nullable = false` |
| Con `LogbookEntity` | `@ManyToOne` | `logbook_id` | `nullable = false` |

`FolioBlockEntity` no declara en su entidad una colección inversa hacia folios; el lado propietario de la FK al bloque está en `FolioEntity` (`folio_block_id`).

---

## `ccasaBackend/src/main/java/com/backend/ccasa/persistence/entities/FolioEntity.java`

```java
package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.models.enums.FolioStatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "folio")
public class FolioEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "folio_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "folio_block_id", nullable = false)
	private FolioBlockEntity folioBlock;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "logbook_id", nullable = false)
	private LogbookEntity logbook;

	@Column(name = "folio_number", nullable = false)
	private Integer folioNumber;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private FolioStatusEnum status = FolioStatusEnum.Open;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public FolioBlockEntity getFolioBlock() { return folioBlock; }
	public void setFolioBlock(FolioBlockEntity folioBlock) { this.folioBlock = folioBlock; }
	public LogbookEntity getLogbook() { return logbook; }
	public void setLogbook(LogbookEntity logbook) { this.logbook = logbook; }
	public Integer getFolioNumber() { return folioNumber; }
	public void setFolioNumber(Integer folioNumber) { this.folioNumber = folioNumber; }
	public FolioStatusEnum getStatus() { return status; }
	public void setStatus(FolioStatusEnum status) { this.status = status; }
}
```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/persistence/entities/FolioBlockEntity.java`

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
 * Bloque de folios (RF-03: al folio 200 nuevo bloque identificador ej. 1-MT).
 */
@Entity
@Table(name = "folio_block")
public class FolioBlockEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "folio_block_id")
	private Long id;

	@Column(name = "identifier", nullable = false, length = 50)
	private String identifier;

	@Column(name = "start_number", nullable = false)
	private Integer startNumber;

	@Column(name = "end_number", nullable = false)
	private Integer endNumber;

	@Column(name = "cover_generated", nullable = false)
	private boolean coverGenerated = false;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getIdentifier() { return identifier; }
	public void setIdentifier(String identifier) { this.identifier = identifier; }
	public Integer getStartNumber() { return startNumber; }
	public void setStartNumber(Integer startNumber) { this.startNumber = startNumber; }
	public Integer getEndNumber() { return endNumber; }
	public void setEndNumber(Integer endNumber) { this.endNumber = endNumber; }
	public boolean isCoverGenerated() { return coverGenerated; }
	public void setCoverGenerated(boolean coverGenerated) { this.coverGenerated = coverGenerated; }
}
```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/controllers/crud/FolioCrudController.java`

```java
package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.service.IFolioCrudService;
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
@RequestMapping("/api/v1/folios")
public class FolioCrudController {

	private final IFolioCrudService service;

	public FolioCrudController(IFolioCrudService service) {
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

## `ccasaBackend/src/main/java/com/backend/ccasa/controllers/crud/FolioBlockCrudController.java`

```java
package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.service.IFolioBlockCrudService;
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
@RequestMapping("/api/v1/folio-blocks")
public class FolioBlockCrudController {

	private final IFolioBlockCrudService service;

	public FolioBlockCrudController(IFolioBlockCrudService service) {
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

## Rutas de API (resumen)

| Recurso | Base path |
|---------|-----------|
| Folios | `/api/v1/folios` |
| Bloques de folio | `/api/v1/folio-blocks` |

Operaciones: `POST` crear, `GET` listar, `GET /{id}` por id, `PUT /{id}` actualizar, `DELETE /{id}` borrar (según implementación del servicio).
