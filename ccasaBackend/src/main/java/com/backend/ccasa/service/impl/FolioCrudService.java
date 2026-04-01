package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.FolioEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class FolioCrudService extends AbstractEntityCrudService<FolioEntity> {

	public FolioCrudService(EntityManager entityManager) {
		super(entityManager, FolioEntity.class, id -> new ResourceNotFoundException("FOLIO", id));
	}
}
