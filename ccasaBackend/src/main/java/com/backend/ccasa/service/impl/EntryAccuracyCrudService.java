package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity;
import com.backend.ccasa.persistence.repositories.EntryAccuracyRepository;
import com.backend.ccasa.service.IEntryAccuracyCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryAccuracyCrudService extends AbstractEntityCrudService<EntryAccuracyEntity> implements IEntryAccuracyCrudService {

	public EntryAccuracyCrudService(EntryAccuracyRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryAccuracyEntity.class, "E_NT_RY_AC_CU_RA_CY");
	}

	@Override
	protected EntryAccuracyEntity newEntity() {
		return new EntryAccuracyEntity();
	}
}
