package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.UserEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class UserCrudService extends AbstractEntityCrudService<UserEntity> {

	public UserCrudService(EntityManager entityManager) {
		super(entityManager, UserEntity.class, id -> new ResourceNotFoundException("USER", id));
	}
}
