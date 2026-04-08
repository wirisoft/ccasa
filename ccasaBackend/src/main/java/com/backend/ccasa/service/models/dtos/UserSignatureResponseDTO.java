package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.time.Instant;

public record UserSignatureResponseDTO(
	Long userId,
	String fileName,
	String contentType,
	String storagePath,
	Instant uploadedAt
) implements Serializable {
}
