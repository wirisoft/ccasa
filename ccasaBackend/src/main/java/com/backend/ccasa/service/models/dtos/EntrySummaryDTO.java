package com.backend.ccasa.service.models.dtos;

import java.time.Instant;
import java.io.Serializable;

/**
 * Resumen de entrada para listados.
 */
public record EntrySummaryDTO(
	Long id,
	Long folioId,
	Integer folioNumber,
	Long logbookId,
	Integer logbookCode,
	String logbookName,
	Long userId,
	String entryStatus,
	Instant recordedAt
) implements Serializable {}

