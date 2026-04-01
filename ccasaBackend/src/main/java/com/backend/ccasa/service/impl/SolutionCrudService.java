package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.repositories.SolutionRepository;
import com.backend.ccasa.service.ISolutionCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class SolutionCrudService extends AbstractEntityCrudService<SolutionEntity> implements ISolutionCrudService {

	public SolutionCrudService(SolutionRepository repository, EntityManager entityManager) {
		super(repository, entityManager, SolutionEntity.class, "S_OL_UT_IO_N");
	}

	@Override
	protected SolutionEntity newEntity() {
		return new SolutionEntity();
	}
}
