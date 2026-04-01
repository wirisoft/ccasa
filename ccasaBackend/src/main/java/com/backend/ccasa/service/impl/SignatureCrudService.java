package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.SignatureEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class SignatureCrudService extends AbstractEntityCrudService<SignatureEntity> {

	public SignatureCrudService(EntityManager entityManager) {
		super(entityManager, SignatureEntity.class, id -> new ResourceNotFoundException("SIGNATURE", id));
	}
}
