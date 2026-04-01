package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryCrudService extends AbstractEntityCrudService<EntryEntity> {

	public EntryCrudService(EntityManager entityManager) {
		super(entityManager, EntryEntity.class, id -> new ResourceNotFoundException("ENTRY", id));
	}
}
