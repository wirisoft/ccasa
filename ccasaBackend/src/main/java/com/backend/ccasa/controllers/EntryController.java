package com.backend.ccasa.controllers;

import com.backend.ccasa.service.IEntryQueryService;
import com.backend.ccasa.services.models.dtos.EntrySummaryDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API de entradas por bitácora. Parámetro de path al final (convención REST).
 */
@RestController
@RequestMapping("/api/v1/entries")
public class EntryController {

	private final IEntryQueryService entryQueryService;

	public EntryController(IEntryQueryService entryQueryService) {
		this.entryQueryService = entryQueryService;
	}

	@GetMapping("/by-logbook/{logbookId}")
	public ResponseEntity<List<EntrySummaryDTO>> listByLogbook(@PathVariable Long logbookId) {
		return ResponseEntity.ok(entryQueryService.findByLogbookId(logbookId));
	}
}
