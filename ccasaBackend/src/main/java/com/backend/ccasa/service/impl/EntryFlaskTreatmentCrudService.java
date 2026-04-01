package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryFlaskTreatmentEntity;
import com.backend.ccasa.persistence.repositories.EntryFlaskTreatmentRepository;
import com.backend.ccasa.service.IEntryFlaskTreatmentCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryFlaskTreatmentCrudService extends AbstractEntityCrudService<EntryFlaskTreatmentEntity> implements IEntryFlaskTreatmentCrudService {

	public EntryFlaskTreatmentCrudService(EntryFlaskTreatmentRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryFlaskTreatmentEntity.class, "E_NT_RY_FL_AS_KT_RE_AT_ME_NT");
	}

	@Override
	protected EntryFlaskTreatmentEntity newEntity() {
		return new EntryFlaskTreatmentEntity();
	}
}
