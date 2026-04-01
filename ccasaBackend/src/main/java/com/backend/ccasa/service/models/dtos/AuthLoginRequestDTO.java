package com.backend.ccasa.service.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

public record AuthLoginRequestDTO(
	@NotBlank @Email String email,
	@NotBlank String password
) implements Serializable {
}
