package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import java.util.List;

public interface IEntrySolutionPrepCrudService {

	CrudResponseDTO create(CrudRequestDTO request);

	List<CrudResponseDTO> findAllActive();

	CrudResponseDTO findById(Long id);

	CrudResponseDTO update(Long id, CrudRequestDTO request);

	void delete(Long id);
}