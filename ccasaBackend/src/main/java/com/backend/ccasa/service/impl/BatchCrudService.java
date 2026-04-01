package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.BatchEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class BatchCrudService extends AbstractEntityCrudService<BatchEntity> {

	public BatchCrudService(EntityManager entityManager) {
		super(entityManager, BatchEntity.class, id -> new ResourceNotFoundException("BATCH", id));
	}
}
