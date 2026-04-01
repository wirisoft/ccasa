package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class LogbookCrudService extends AbstractEntityCrudService<LogbookEntity> {

	public LogbookCrudService(EntityManager entityManager) {
		super(entityManager, LogbookEntity.class, id -> new ResourceNotFoundException("LOGBOOK", id));
	}
}
