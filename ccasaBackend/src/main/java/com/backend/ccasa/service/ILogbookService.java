package com.backend.ccasa.service;

import com.backend.ccasa.services.models.dtos.LogbookDTO;
import java.util.List;

/**
 * Contrato del servicio de bitácoras.
 */
public interface ILogbookService {

	List<LogbookDTO> findAllActive();

	LogbookDTO getById(Long id);
}
