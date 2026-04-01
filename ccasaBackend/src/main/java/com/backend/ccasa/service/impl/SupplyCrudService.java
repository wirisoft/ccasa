package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.SupplyEntity;
import com.backend.ccasa.persistence.repositories.SupplyRepository;
import com.backend.ccasa.service.ISupplyCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class SupplyCrudService extends AbstractEntityCrudService<SupplyEntity> implements ISupplyCrudService {

	public SupplyCrudService(SupplyRepository repository, EntityManager entityManager) {
		super(repository, entityManager, SupplyEntity.class, "S_UP_PL_Y");
	}

	@Override
	protected SupplyEntity newEntity() {
		return new SupplyEntity();
	}
}
