package com.backend.ccasa.controllers;

import com.backend.ccasa.service.IDistilledWaterEntryService;
import com.backend.ccasa.service.models.dtos.DistilledWaterRequestDTO;
import com.backend.ccasa.service.models.dtos.DistilledWaterResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API de entradas de agua destilada (RF-08).
 */
@RestController
@RequestMapping("/api/v1/entries")
public class DistilledWaterController {

	private final IDistilledWaterEntryService distilledWaterEntryService;

	public DistilledWaterController(IDistilledWaterEntryService distilledWaterEntryService) {
		this.distilledWaterEntryService = distilledWaterEntryService;
	}

	@GetMapping("/{entryId}/distilled-water")
	public ResponseEntity<DistilledWaterResponseDTO> get(@PathVariable Long entryId) {
		return ResponseEntity.ok(distilledWaterEntryService.getByEntryId(entryId));
	}

	@PostMapping("/distilled-water")
	public ResponseEntity<DistilledWaterResponseDTO> create(@Valid @RequestBody DistilledWaterRequestDTO dto) {
		return ResponseEntity.ok(distilledWaterEntryService.create(dto));
	}
}

