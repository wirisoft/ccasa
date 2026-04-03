package com.backend.ccasa.services.models.dtos;

import java.io.Serializable;

/**
 * Respuesta de login con JWT para el cliente (Bearer).
 */
public record LoginResponseDTO(
		String accessToken,
		String tokenType,
		long expiresInSeconds,
		String email,
		String role
) implements Serializable {}
