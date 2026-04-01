package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.repositories.EntryRepository;
import com.backend.ccasa.service.IEntryCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryCrudService extends AbstractEntityCrudService<EntryEntity> implements IEntryCrudService {

	public EntryCrudService(EntryRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryEntity.class, "E_NT_RY");
	}

	@Override
	protected EntryEntity newEntity() {
		return new EntryEntity();
	}
}
