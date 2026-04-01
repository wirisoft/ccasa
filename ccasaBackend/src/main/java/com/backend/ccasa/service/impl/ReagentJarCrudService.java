package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.ReagentJarEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class ReagentJarCrudService extends AbstractEntityCrudService<ReagentJarEntity> {

	public ReagentJarCrudService(EntityManager entityManager) {
		super(entityManager, ReagentJarEntity.class, id -> new ResourceNotFoundException("REAGENT_JAR", id));
	}
}
