package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.util.Map;

public record CrudResponseDTO(Long id, Map<String, Object> values) implements Serializable {
}

