package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntrySolutionPrepCrudService extends AbstractEntityCrudService<EntrySolutionPrepEntity> {

	public EntrySolutionPrepCrudService(EntityManager entityManager) {
		super(entityManager, EntrySolutionPrepEntity.class, id -> new ResourceNotFoundException("ENTRY_SOLUTION_PREP", id));
	}
}
