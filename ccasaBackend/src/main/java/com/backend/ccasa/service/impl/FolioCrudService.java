package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.repositories.FolioRepository;
import com.backend.ccasa.service.IFolioCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class FolioCrudService extends AbstractEntityCrudService<FolioEntity> implements IFolioCrudService {

	public FolioCrudService(FolioRepository repository, EntityManager entityManager) {
		super(repository, entityManager, FolioEntity.class, "F_OL_IO");
	}

	@Override
	protected FolioEntity newEntity() {
		return new FolioEntity();
	}
}
