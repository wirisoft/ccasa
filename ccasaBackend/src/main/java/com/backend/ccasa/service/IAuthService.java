package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.AuthLoginRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthRegisterRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthResponseDTO;

public interface IAuthService {

	AuthResponseDTO register(AuthRegisterRequestDTO request);

	AuthResponseDTO login(AuthLoginRequestDTO request);

	AuthResponseDTO createInitialAdmin();
}
