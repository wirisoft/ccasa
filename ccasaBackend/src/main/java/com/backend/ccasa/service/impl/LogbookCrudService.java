package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.service.ILogbookCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class LogbookCrudService extends AbstractEntityCrudService<LogbookEntity> implements ILogbookCrudService {

	public LogbookCrudService(LogbookRepository repository, EntityManager entityManager) {
		super(repository, entityManager, LogbookEntity.class, "L_OG_BO_OK");
	}

	@Override
	protected LogbookEntity newEntity() {
		return new LogbookEntity();
	}
}
