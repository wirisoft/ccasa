package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.repositories.BatchRepository;
import com.backend.ccasa.service.IBatchCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class BatchCrudService extends AbstractEntityCrudService<BatchEntity> implements IBatchCrudService {

	public BatchCrudService(BatchRepository repository, EntityManager entityManager) {
		super(repository, entityManager, BatchEntity.class, "B_AT_CH");
	}

	@Override
	protected BatchEntity newEntity() {
		return new BatchEntity();
	}
}
