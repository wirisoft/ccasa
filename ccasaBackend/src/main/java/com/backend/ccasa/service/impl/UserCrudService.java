package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.IUserCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class UserCrudService extends AbstractEntityCrudService<UserEntity> implements IUserCrudService {

	public UserCrudService(UserRepository repository, EntityManager entityManager) {
		super(repository, entityManager, UserEntity.class, "U_SE_R");
	}

	@Override
	protected UserEntity newEntity() {
		return new UserEntity();
	}
}
