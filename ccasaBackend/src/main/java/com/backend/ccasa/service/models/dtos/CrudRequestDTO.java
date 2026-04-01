package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.util.Map;

public record CrudRequestDTO(Map<String, Object> values) implements Serializable {
}

