package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.RoleEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class RoleCrudService extends AbstractEntityCrudService<RoleEntity> {

	public RoleCrudService(EntityManager entityManager) {
		super(entityManager, RoleEntity.class, id -> new ResourceNotFoundException("ROLE", id));
	}
}
