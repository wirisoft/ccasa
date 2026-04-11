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
	String entryStatus,
	String logbookName,
	String analystName,
	String samplerName,
	String folio,
	String recordedAt
) implements Serializable {}

