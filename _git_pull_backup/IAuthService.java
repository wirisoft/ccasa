package com.backend.ccasa.service;

import com.backend.ccasa.services.models.dtos.LoginRequestDTO;
import com.backend.ccasa.services.models.dtos.LoginResponseDTO;

/**
 * Autenticación: login y emisión de JWT.
 */
public interface IAuthService {

	LoginResponseDTO login(LoginRequestDTO request);
}
