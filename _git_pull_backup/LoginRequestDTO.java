package com.backend.ccasa.services.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

/**
 * Credenciales de acceso (POST /api/v1/auth/login).
 */
public record LoginRequestDTO(
		@NotBlank @Email String email,
		@NotBlank String password
) implements Serializable {}
