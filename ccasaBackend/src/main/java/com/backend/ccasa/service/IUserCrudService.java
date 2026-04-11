package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.CrudResponseDTO;

public interface IUserCrudService extends ITypedCrudService {

	CrudResponseDTO findByEmail(String email);
}
