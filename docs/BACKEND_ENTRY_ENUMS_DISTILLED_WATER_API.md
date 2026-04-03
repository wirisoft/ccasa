# Backend: enums de entrada, agua destilada (controlador y DTOs)

Referencia con el contenido completo de los archivos en `ccasaBackend` (copia al momento de generar este documento).

> **Nota:** En el repositorio, el Javadoc de `EntryStatusEnum.java` puede mostrar caracteres mal codificados (`bitÃ¡cora`, `â†’`); el texto previsto es «bitácora» y la flecha en la transición Draft → Signed → Locked.

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/enums/EntryStatusEnum.java`

```java
package com.backend.ccasa.service.models.enums;

/**
 * Estado de entrada de bitÃ¡cora (RNF-01: Draft â†’ Signed â†’ Locked).
 */
public enum EntryStatusEnum {
	Draft,
	Signed,
	Locked
}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/enums/WaterTypeEnum.java`

```java
package com.backend.ccasa.service.models.enums;

/**
 * Tipo de agua en carta de gastos (RF-04).
 */
public enum WaterTypeEnum {
	Distilled,
	Type
}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/enums/PieceTypeEnum.java`

```java
package com.backend.ccasa.service.models.enums;

/**
 * Tipo de pieza en lavado de material (RF-09).
 */
public enum PieceTypeEnum {
	Carboy,
	Flask
}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/enums/ConductivityTypeEnum.java`

```java
package com.backend.ccasa.service.models.enums;

/**
 * Tipo de conductividad (RF-05).
 */
public enum ConductivityTypeEnum {
	High,
	Low
}

```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/controllers/DistilledWaterController.java`

Controlador de dominio (no `CrudController`).

```java
package com.backend.ccasa.controllers;

import com.backend.ccasa.service.IDistilledWaterEntryService;
import com.backend.ccasa.service.models.dtos.DistilledWaterRequestDTO;
import com.backend.ccasa.service.models.dtos.DistilledWaterResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API de entradas de agua destilada (RF-08).
 */
@RestController
@RequestMapping("/api/v1/entries")
public class DistilledWaterController {

	private final IDistilledWaterEntryService distilledWaterEntryService;

	public DistilledWaterController(IDistilledWaterEntryService distilledWaterEntryService) {
		this.distilledWaterEntryService = distilledWaterEntryService;
	}

	@GetMapping("/{entryId}/distilled-water")
	public ResponseEntity<DistilledWaterResponseDTO> get(@PathVariable Long entryId) {
		return ResponseEntity.ok(distilledWaterEntryService.getByEntryId(entryId));
	}

	@PostMapping("/distilled-water")
	public ResponseEntity<DistilledWaterResponseDTO> create(@Valid @RequestBody DistilledWaterRequestDTO dto) {
		return ResponseEntity.ok(distilledWaterEntryService.create(dto));
	}
}
```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/DistilledWaterRequestDTO.java`

```java
package com.backend.ccasa.service.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.io.Serializable;

/**
 * Request para crear/actualizar entrada de agua destilada (RF-08).
 */
public record DistilledWaterRequestDTO(
	@NotNull Long folioId,
	@NotNull Long logbookId,
	@NotNull Long userId,
	BigDecimal phReading1,
	BigDecimal phReading2,
	BigDecimal phReading3,
	BigDecimal ceReading1,
	BigDecimal ceReading2,
	BigDecimal ceReading3,
	BigDecimal referenceDifference,
	BigDecimal controlStandardPct,
	Long waterBatchId
) implements Serializable {}
```

---

## `ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/DistilledWaterResponseDTO.java`

```java
package com.backend.ccasa.service.models.dtos;

import java.math.BigDecimal;
import java.io.Serializable;

/**
 * Respuesta con datos de entrada de agua destilada.
 */
public record DistilledWaterResponseDTO(
	Long entryId,
	Long distilledWaterEntryId,
	BigDecimal phReading1,
	BigDecimal phReading2,
	BigDecimal phReading3,
	BigDecimal phAverage,
	BigDecimal ceReading1,
	BigDecimal ceReading2,
	BigDecimal ceReading3,
	BigDecimal ceAverage,
	BigDecimal referenceDifference,
	BigDecimal controlStandardPct,
	Boolean isAcceptable,
	Long waterBatchId,
	String entryStatus
) implements Serializable {}
```
