package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.FolioBlockEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class FolioBlockCrudService extends AbstractEntityCrudService<FolioBlockEntity> {

	public FolioBlockCrudService(EntityManager entityManager) {
		super(entityManager, FolioBlockEntity.class, id -> new ResourceNotFoundException("FOLIO_BLOCK", id));
	}
}
