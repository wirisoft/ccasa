package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;

public record ResetPasswordResponseDTO(String temporaryPassword) implements Serializable {
}
