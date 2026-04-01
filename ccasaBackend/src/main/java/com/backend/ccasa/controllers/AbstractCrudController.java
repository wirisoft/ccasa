package com.backend.ccasa.controllers;

import com.backend.ccasa.service.IResourceCrudService;
import com.backend.ccasa.services.models.dtos.CrudRequestDTO;
import com.backend.ccasa.services.models.dtos.CrudResponseDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

public abstract class AbstractCrudController {

	private final IResourceCrudService resourceCrudService;

	protected AbstractCrudController(IResourceCrudService resourceCrudService) {
		this.resourceCrudService = resourceCrudService;
	}

	@PostMapping
	public ResponseEntity<CrudResponseDTO> create(@RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(resourceCrudService.create(request));
	}

	@GetMapping
	public ResponseEntity<List<CrudResponseDTO>> list() {
		return ResponseEntity.ok(resourceCrudService.findAllActive());
	}

	@GetMapping("/{id}")
	public ResponseEntity<CrudResponseDTO> get(@PathVariable Long id) {
		return ResponseEntity.ok(resourceCrudService.findById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<CrudResponseDTO> update(@PathVariable Long id, @RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(resourceCrudService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		resourceCrudService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
