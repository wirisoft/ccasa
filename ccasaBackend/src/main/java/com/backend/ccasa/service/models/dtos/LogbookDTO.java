package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;

/**
 * DTO para bitÃ¡cora (UI-01 dashboard).
 */
public record LogbookDTO(Long id, Integer code, String name, String description, Integer maxEntries) implements Serializable {}

