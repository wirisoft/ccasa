package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity;
import com.backend.ccasa.persistence.repositories.EntryDistilledWaterRepository;
import com.backend.ccasa.service.IEntryDistilledWaterCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryDistilledWaterCrudService extends AbstractEntityCrudService<EntryDistilledWaterEntity> implements IEntryDistilledWaterCrudService {

	public EntryDistilledWaterCrudService(EntryDistilledWaterRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryDistilledWaterEntity.class, "E_NT_RY_DI_ST_IL_LE_DW_AT_ER");
	}

	@Override
	protected EntryDistilledWaterEntity newEntity() {
		return new EntryDistilledWaterEntity();
	}
}
