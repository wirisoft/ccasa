package com.backend.ccasa.service;

import com.backend.ccasa.service.models.dtos.AuthLoginRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthRegisterRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthResponseDTO;
import com.backend.ccasa.service.models.dtos.ResetPasswordResponseDTO;

public interface IAuthService {

	AuthResponseDTO register(AuthRegisterRequestDTO request);

	AuthResponseDTO login(AuthLoginRequestDTO request);

	AuthResponseDTO createInitialAdmin();

	/** Forgot-password MVP: siempre retorna sin revelar si el email existe. */
	void forgotPassword(String email);

	/** Cambia la contraseña del usuario autenticado. */
	void changePassword(Long userId, String currentPassword, String newPassword);

	/** Admin resetea la contraseña de otro usuario, devuelve contraseña temporal. */
	ResetPasswordResponseDTO resetPassword(Long targetUserId);
}
