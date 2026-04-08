package com.backend.ccasa.service;

import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import com.backend.ccasa.service.models.dtos.SignEntryRequestDTO;

public interface ISignatureCrudService extends ITypedCrudService {

	/**
	 * Firma una entrada con validación de reglas de negocio:
	 * - Analyst firma → Draft→Signed
	 * - Supervisor firma → Signed→Locked
	 */
	CrudResponseDTO signEntry(Long entryId, SignEntryRequestDTO request, CcasaUserDetails principal);
}