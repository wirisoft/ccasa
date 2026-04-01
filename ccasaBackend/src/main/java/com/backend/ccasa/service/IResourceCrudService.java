package com.backend.ccasa.service;

import com.backend.ccasa.services.models.dtos.CrudRequestDTO;
import com.backend.ccasa.services.models.dtos.CrudResponseDTO;
import java.util.List;

public interface IResourceCrudService {

	CrudResponseDTO create(CrudRequestDTO request);

	List<CrudResponseDTO> findAllActive();

	CrudResponseDTO findById(Long id);

	CrudResponseDTO update(Long id, CrudRequestDTO request);

	void delete(Long id);
}
