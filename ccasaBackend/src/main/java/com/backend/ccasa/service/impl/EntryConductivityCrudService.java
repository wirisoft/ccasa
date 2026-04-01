package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryConductivityCrudService extends AbstractEntityCrudService<EntryConductivityEntity> {

	public EntryConductivityCrudService(EntityManager entityManager) {
		super(entityManager, EntryConductivityEntity.class, id -> new ResourceNotFoundException("ENTRY_CONDUCTIVITY", id));
	}
}
