package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.AlertEntity;
import com.backend.ccasa.persistence.repositories.AlertRepository;
import com.backend.ccasa.service.IAlertCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class AlertCrudService extends AbstractEntityCrudService<AlertEntity> implements IAlertCrudService {

	public AlertCrudService(AlertRepository repository, EntityManager entityManager) {
		super(repository, entityManager, AlertEntity.class, "A_LE_RT");
	}

	@Override
	protected AlertEntity newEntity() {
		return new AlertEntity();
	}
}
