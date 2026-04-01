package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity;
import com.backend.ccasa.persistence.repositories.EntrySolutionPrepRepository;
import com.backend.ccasa.service.IEntrySolutionPrepCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntrySolutionPrepCrudService extends AbstractEntityCrudService<EntrySolutionPrepEntity> implements IEntrySolutionPrepCrudService {

	public EntrySolutionPrepCrudService(EntrySolutionPrepRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntrySolutionPrepEntity.class, "E_NT_RY_SO_LU_TI_ON_PR_EP");
	}

	@Override
	protected EntrySolutionPrepEntity newEntity() {
		return new EntrySolutionPrepEntity();
	}
}
