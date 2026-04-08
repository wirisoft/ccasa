package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ITypedCrudService {

	CrudResponseDTO create(CrudRequestDTO request);

	List<CrudResponseDTO> findAllActive();

	Page<CrudResponseDTO> findAllActive(Pageable pageable);

	CrudResponseDTO findById(Long id);

	CrudResponseDTO update(Long id, CrudRequestDTO request);

	void delete(Long id);

	void restore(Long id);
}
