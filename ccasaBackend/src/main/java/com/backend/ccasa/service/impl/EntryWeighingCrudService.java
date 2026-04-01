package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryWeighingCrudService extends AbstractEntityCrudService<EntryWeighingEntity> {

	public EntryWeighingCrudService(EntityManager entityManager) {
		super(entityManager, EntryWeighingEntity.class, id -> new ResourceNotFoundException("ENTRY_WEIGHING", id));
	}
}
