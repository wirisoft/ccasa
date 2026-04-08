package com.backend.ccasa.service.models.dtos;

import java.io.Serializable;
import java.util.List;

public record ConductivityBatchPdfRequestDTO(List<Long> conductivityIds) implements Serializable {
}
