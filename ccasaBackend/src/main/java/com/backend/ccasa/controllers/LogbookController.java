package com.backend.ccasa.controllers;

import com.backend.ccasa.service.ILogbookService;
import com.backend.ccasa.service.impl.LogbookCrudService;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import com.backend.ccasa.service.models.dtos.LogbookDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API de bitácoras (UI-01: dashboard 15 bitácoras).
 */
@RestController
@RequestMapping("/api/v1/logbooks")
public class LogbookController {

	private final ILogbookService logbookService;
	private final LogbookCrudService logbookCrudService;

	public LogbookController(ILogbookService logbookService, LogbookCrudService logbookCrudService) {
		this.logbookService = logbookService;
		this.logbookCrudService = logbookCrudService;
	}

	@GetMapping
	public ResponseEntity<List<LogbookDTO>> list() {
		return ResponseEntity.ok(logbookService.findAllActive());
	}

	@GetMapping("/{id}")
	public ResponseEntity<LogbookDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(logbookService.getById(id));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
	public ResponseEntity<CrudResponseDTO> create(@RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(logbookCrudService.create(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
	public ResponseEntity<CrudResponseDTO> update(@PathVariable Long id, @RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(logbookCrudService.update(id, request));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		logbookCrudService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
