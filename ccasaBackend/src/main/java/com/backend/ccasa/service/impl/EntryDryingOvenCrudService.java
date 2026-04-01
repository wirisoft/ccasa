package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryDryingOvenEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryDryingOvenCrudService extends AbstractEntityCrudService<EntryDryingOvenEntity> {

	public EntryDryingOvenCrudService(EntityManager entityManager) {
		super(entityManager, EntryDryingOvenEntity.class, id -> new ResourceNotFoundException("ENTRY_DRYING_OVEN", id));
	}
}
