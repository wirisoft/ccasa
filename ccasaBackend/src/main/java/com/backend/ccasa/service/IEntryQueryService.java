package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.EntrySummaryDTO;
import java.util.List;

/**
 * Contrato del servicio de consulta de entradas.
 */
public interface IEntryQueryService {

	List<EntrySummaryDTO> findByLogbookId(Long logbookId);
}

