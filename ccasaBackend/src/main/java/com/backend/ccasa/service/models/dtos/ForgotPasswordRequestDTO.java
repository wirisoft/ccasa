package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;

public record ForgotPasswordRequestDTO(String email) implements Serializable {
}
