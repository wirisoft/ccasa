package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.AlertEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class AlertCrudService extends AbstractEntityCrudService<AlertEntity> {

	public AlertCrudService(EntityManager entityManager) {
		super(entityManager, AlertEntity.class, id -> new ResourceNotFoundException("ALERT", id));
	}
}
