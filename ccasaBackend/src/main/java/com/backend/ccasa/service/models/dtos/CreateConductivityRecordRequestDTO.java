package com.backend.ccasa.service.models.dtos;

import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;

public record CreateConductivityRecordRequestDTO(
	ConductivityTypeEnum type,
	BigDecimal weightGrams,
	Instant recordedAt,
	LocalTime preparationTime,
	String observation,
	Long logbookId
) implements Serializable {
}
