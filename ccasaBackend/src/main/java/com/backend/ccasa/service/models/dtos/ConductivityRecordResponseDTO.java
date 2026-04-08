package com.backend.ccasa.service.models.dtos;

import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;

public record ConductivityRecordResponseDTO(
	Long conductivityId,
	Long entryId,
	String displayFolio,
	ConductivityTypeEnum type,
	BigDecimal weightGrams,
	BigDecimal referenceUScm,
	BigDecimal referenceMol,
	BigDecimal calculatedMol,
	BigDecimal referenceStandardUScm,
	BigDecimal calculatedValue,
	Boolean inRange,
	Instant recordedAt,
	LocalTime preparationTime,
	String observation,
	EntryStatusEnum status,
	Long createdByUserId,
	String createdByName,
	String createdByNomenclature,
	Long reviewerUserId,
	String reviewerName,
	String reviewerNomenclature,
	Instant reviewedAt
) implements Serializable {
}
