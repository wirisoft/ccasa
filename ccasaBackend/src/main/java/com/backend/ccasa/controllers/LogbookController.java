package com.backend.ccasa.controllers;

import com.backend.ccasa.service.ILogbookService;
import com.backend.ccasa.services.models.dtos.LogbookDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API de bitácoras (UI-01: dashboard 15 bitácoras).
 */
@RestController
@RequestMapping("/api/v1/logbooks")
public class LogbookController {

	private final ILogbookService logbookService;

	public LogbookController(ILogbookService logbookService) {
		this.logbookService = logbookService;
	}

	@GetMapping
	public ResponseEntity<List<LogbookDTO>> list() {
		return ResponseEntity.ok(logbookService.findAllActive());
	}

	@GetMapping("/{id}")
	public ResponseEntity<LogbookDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(logbookService.getById(id));
	}
}
