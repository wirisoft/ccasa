package com.backend.ccasa.services.models.dtos;

import java.io.Serializable;

/**
 * DTO para bitácora (UI-01 dashboard).
 */
public record LogbookDTO(Long id, Integer code, String name, String description, Integer maxEntries) implements Serializable {}
