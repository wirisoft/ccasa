package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryMaterialWashCrudService extends AbstractEntityCrudService<EntryMaterialWashEntity> {

	public EntryMaterialWashCrudService(EntityManager entityManager) {
		super(entityManager, EntryMaterialWashEntity.class, id -> new ResourceNotFoundException("ENTRY_MATERIAL_WASH", id));
	}
}
