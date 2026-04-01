package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryOvenTempCrudService extends AbstractEntityCrudService<EntryOvenTempEntity> {

	public EntryOvenTempCrudService(EntityManager entityManager) {
		super(entityManager, EntryOvenTempEntity.class, id -> new ResourceNotFoundException("ENTRY_OVEN_TEMP", id));
	}
}
