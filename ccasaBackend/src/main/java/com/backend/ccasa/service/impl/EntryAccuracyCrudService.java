package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryAccuracyCrudService extends AbstractEntityCrudService<EntryAccuracyEntity> {

	public EntryAccuracyCrudService(EntityManager entityManager) {
		super(entityManager, EntryAccuracyEntity.class, id -> new ResourceNotFoundException("ENTRY_ACCURACY", id));
	}
}
