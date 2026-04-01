package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.SupplyEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class SupplyCrudService extends AbstractEntityCrudService<SupplyEntity> {

	public SupplyCrudService(EntityManager entityManager) {
		super(entityManager, SupplyEntity.class, id -> new ResourceNotFoundException("SUPPLY", id));
	}
}
