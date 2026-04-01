package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryDryingOvenEntity;
import com.backend.ccasa.persistence.repositories.EntryDryingOvenRepository;
import com.backend.ccasa.service.IEntryDryingOvenCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryDryingOvenCrudService extends AbstractEntityCrudService<EntryDryingOvenEntity> implements IEntryDryingOvenCrudService {

	public EntryDryingOvenCrudService(EntryDryingOvenRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryDryingOvenEntity.class, "E_NT_RY_DR_YI_NG_OV_EN");
	}

	@Override
	protected EntryDryingOvenEntity newEntity() {
		return new EntryDryingOvenEntity();
	}
}
