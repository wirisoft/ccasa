package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity;
import com.backend.ccasa.persistence.repositories.EntryMaterialWashRepository;
import com.backend.ccasa.service.IEntryMaterialWashCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryMaterialWashCrudService extends AbstractEntityCrudService<EntryMaterialWashEntity> implements IEntryMaterialWashCrudService {

	public EntryMaterialWashCrudService(EntryMaterialWashRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryMaterialWashEntity.class, "E_NT_RY_MA_TE_RI_AL_WA_SH");
	}

	@Override
	protected EntryMaterialWashEntity newEntity() {
		return new EntryMaterialWashEntity();
	}
}
