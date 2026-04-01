package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.repositories.RoleRepository;
import com.backend.ccasa.service.IRoleCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class RoleCrudService extends AbstractEntityCrudService<RoleEntity> implements IRoleCrudService {

	public RoleCrudService(RoleRepository repository, EntityManager entityManager) {
		super(repository, entityManager, RoleEntity.class, "R_OL_E");
	}

	@Override
	protected RoleEntity newEntity() {
		return new RoleEntity();
	}
}
