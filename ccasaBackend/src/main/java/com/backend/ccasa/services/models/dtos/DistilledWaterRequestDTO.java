package com.backend.ccasa.services.models.dtos;

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
