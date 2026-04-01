package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.persistence.repositories.EntryConductivityRepository;
import com.backend.ccasa.service.IEntryConductivityCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryConductivityCrudService extends AbstractEntityCrudService<EntryConductivityEntity> implements IEntryConductivityCrudService {

	public EntryConductivityCrudService(EntryConductivityRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryConductivityEntity.class, "E_NT_RY_CO_ND_UC_TI_VI_TY");
	}

	@Override
	protected EntryConductivityEntity newEntity() {
		return new EntryConductivityEntity();
	}
}
