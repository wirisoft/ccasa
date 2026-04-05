package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity;
import com.backend.ccasa.persistence.repositories.EntryAccuracyRepository;
import com.backend.ccasa.service.IEntryAccuracyCrudService;
import com.backend.ccasa.service.IReferenceParameterService;
import com.backend.ccasa.service.impl.support.AccuracyEntryComputation;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryAccuracyCrudService extends AbstractEntityCrudService<EntryAccuracyEntity> implements IEntryAccuracyCrudService {

	private final AccuracyEntryComputation accuracyEntryComputation;
	private final IReferenceParameterService referenceParameterService;

	public EntryAccuracyCrudService(
		EntryAccuracyRepository repository,
		EntityManager entityManager,
		AccuracyEntryComputation accuracyEntryComputation,
		IReferenceParameterService referenceParameterService
	) {
		super(repository, entityManager, EntryAccuracyEntity.class, "E_NT_RY_AC_CU_RA_CY");
		this.accuracyEntryComputation = accuracyEntryComputation;
		this.referenceParameterService = referenceParameterService;
	}

	@Override
	protected void afterApply(EntryAccuracyEntity entity) {
		accuracyEntryComputation.apply(entity, referenceParameterService);
	}

	@Override
	protected EntryAccuracyEntity newEntity() {
		return new EntryAccuracyEntity();
	}
}
