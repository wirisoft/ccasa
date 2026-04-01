package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.ReagentJarEntity;
import com.backend.ccasa.persistence.repositories.ReagentJarRepository;
import com.backend.ccasa.service.IReagentJarCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class ReagentJarCrudService extends AbstractEntityCrudService<ReagentJarEntity> implements IReagentJarCrudService {

	public ReagentJarCrudService(ReagentJarRepository repository, EntityManager entityManager) {
		super(repository, entityManager, ReagentJarEntity.class, "R_EA_GE_NT_JA_R");
	}

	@Override
	protected ReagentJarEntity newEntity() {
		return new ReagentJarEntity();
	}
}
