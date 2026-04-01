package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.SignatureEntity;
import com.backend.ccasa.persistence.repositories.SignatureRepository;
import com.backend.ccasa.service.ISignatureCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class SignatureCrudService extends AbstractEntityCrudService<SignatureEntity> implements ISignatureCrudService {

	public SignatureCrudService(SignatureRepository repository, EntityManager entityManager) {
		super(repository, entityManager, SignatureEntity.class, "S_IG_NA_TU_RE");
	}

	@Override
	protected SignatureEntity newEntity() {
		return new SignatureEntity();
	}
}
