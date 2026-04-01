package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.FolioBlockEntity;
import com.backend.ccasa.persistence.repositories.FolioBlockRepository;
import com.backend.ccasa.service.IFolioBlockCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class FolioBlockCrudService extends AbstractEntityCrudService<FolioBlockEntity> implements IFolioBlockCrudService {

	public FolioBlockCrudService(FolioBlockRepository repository, EntityManager entityManager) {
		super(repository, entityManager, FolioBlockEntity.class, "F_OL_IO_BL_OC_K");
	}

	@Override
	protected FolioBlockEntity newEntity() {
		return new FolioBlockEntity();
	}
}
