package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.ReferenceParameterEntity;
import com.backend.ccasa.persistence.repositories.ReferenceParameterRepository;
import com.backend.ccasa.service.IReferenceParameterCrudService;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReferenceParameterCrudService extends AbstractEntityCrudService<ReferenceParameterEntity>
		implements IReferenceParameterCrudService {

	public ReferenceParameterCrudService(ReferenceParameterRepository repository, EntityManager entityManager) {
		super(repository, entityManager, ReferenceParameterEntity.class, "REFERENCE_PARAMETER");
	}

	@Override
	protected ReferenceParameterEntity newEntity() {
		return new ReferenceParameterEntity();
	}

	@Override
	protected List<String> requiredFields() {
		return List.of("code");
	}
}
