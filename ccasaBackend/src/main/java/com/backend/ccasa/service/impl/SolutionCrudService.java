package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class SolutionCrudService extends AbstractEntityCrudService<SolutionEntity> {

	public SolutionCrudService(EntityManager entityManager) {
		super(entityManager, SolutionEntity.class, id -> new ResourceNotFoundException("SOLUTION", id));
	}
}
