package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.ReagentEntity;
import com.backend.ccasa.persistence.repositories.ReagentRepository;
import com.backend.ccasa.service.IReagentCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class ReagentCrudService extends AbstractEntityCrudService<ReagentEntity> implements IReagentCrudService {

	public ReagentCrudService(ReagentRepository repository, EntityManager entityManager) {
		super(repository, entityManager, ReagentEntity.class, "R_EA_GE_NT");
	}

	@Override
	protected ReagentEntity newEntity() {
		return new ReagentEntity();
	}
}
