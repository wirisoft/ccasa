package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.ReagentEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class ReagentCrudService extends AbstractEntityCrudService<ReagentEntity> {

	public ReagentCrudService(EntityManager entityManager) {
		super(entityManager, ReagentEntity.class, id -> new ResourceNotFoundException("REAGENT", id));
	}
}
