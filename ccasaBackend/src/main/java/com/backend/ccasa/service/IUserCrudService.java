package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import java.util.List;

public interface IUserCrudService extends ITypedCrudService {

	CrudResponseDTO findByEmail(String email);

	List<CrudResponseDTO> findByRole(String roleName);
}
