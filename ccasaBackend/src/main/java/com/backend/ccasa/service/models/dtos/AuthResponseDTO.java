package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;

public record AuthResponseDTO(
	String token,
	Long userId,
	String email,
	String role
) implements Serializable {
}
