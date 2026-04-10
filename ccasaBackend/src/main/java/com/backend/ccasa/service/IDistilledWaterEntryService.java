package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.DistilledWaterRequestDTO;
import com.backend.ccasa.service.models.dtos.DistilledWaterResponseDTO;

/**
 * Contrato del servicio de entradas de agua destilada.
 */
public interface IDistilledWaterEntryService {

	DistilledWaterResponseDTO getByEntryId(Long entryId);

	DistilledWaterResponseDTO create(DistilledWaterRequestDTO dto);

	byte[] generatePdf(Long entryId);
}

