package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;

public record ChangePasswordRequestDTO(
	String currentPassword,
	String newPassword
) implements Serializable {
}
