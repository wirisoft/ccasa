package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryFlaskTreatmentEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryFlaskTreatmentCrudService extends AbstractEntityCrudService<EntryFlaskTreatmentEntity> {

	public EntryFlaskTreatmentCrudService(EntityManager entityManager) {
		super(entityManager, EntryFlaskTreatmentEntity.class, id -> new ResourceNotFoundException("ENTRY_FLASK_TREATMENT", id));
	}
}
