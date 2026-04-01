package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity;
import com.backend.ccasa.persistence.repositories.EntryWeighingRepository;
import com.backend.ccasa.service.IEntryWeighingCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryWeighingCrudService extends AbstractEntityCrudService<EntryWeighingEntity> implements IEntryWeighingCrudService {

	public EntryWeighingCrudService(EntryWeighingRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryWeighingEntity.class, "E_NT_RY_WE_IG_HI_NG");
	}

	@Override
	protected EntryWeighingEntity newEntity() {
		return new EntryWeighingEntity();
	}
}
