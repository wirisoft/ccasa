package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.LogbookDTO;
import java.util.List;

/**
 * Contrato del servicio de bitÃ¡coras.
 */
public interface ILogbookService {

	List<LogbookDTO> findAllActive();

	LogbookDTO getById(Long id);
}

