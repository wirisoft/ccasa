package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity;
import com.backend.ccasa.persistence.repositories.EntryOvenTempRepository;
import com.backend.ccasa.service.IEntryOvenTempCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryOvenTempCrudService extends AbstractEntityCrudService<EntryOvenTempEntity> implements IEntryOvenTempCrudService {

	public EntryOvenTempCrudService(EntryOvenTempRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryOvenTempEntity.class, "E_NT_RY_OV_EN_TE_MP");
	}

	@Override
	protected EntryOvenTempEntity newEntity() {
		return new EntryOvenTempEntity();
	}
}
