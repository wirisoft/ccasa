package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryDistilledWaterCrudService extends AbstractEntityCrudService<EntryDistilledWaterEntity> {

	public EntryDistilledWaterCrudService(EntityManager entityManager) {
		super(entityManager, EntryDistilledWaterEntity.class, id -> new ResourceNotFoundException("ENTRY_DISTILLED_WATER", id));
	}
}
