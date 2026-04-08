package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.service.IEntryFlaskTreatmentCrudService;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PatchMapping;

@RestController
@RequestMapping("/api/v1/entry-flask-treatment")
public class EntryFlaskTreatmentCrudController {

	private final IEntryFlaskTreatmentCrudService service;

	public EntryFlaskTreatmentCrudController(IEntryFlaskTreatmentCrudService service) {
		this.service = service;
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ANALYST', 'SUPERVISOR')")
	public ResponseEntity<CrudResponseDTO> create(@RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(service.create(request));
	}

	@GetMapping
	public ResponseEntity<List<CrudResponseDTO>> getAll() {
		return ResponseEntity.ok(service.findAllActive());
	}

	@GetMapping("/{id}")
	public ResponseEntity<CrudResponseDTO> getById(@PathVariable Long id) {
		return ResponseEntity.ok(service.findById(id));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyRole('ANALYST', 'SUPERVISOR')")
	public ResponseEntity<CrudResponseDTO> update(@PathVariable Long id, @RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(service.update(id, request));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ANALYST', 'SUPERVISOR')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/restore")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> restore(@PathVariable Long id) {
		service.restore(id);
		return ResponseEntity.ok().build();
	}
}