package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity;
import com.backend.ccasa.persistence.repositories.EntryOvenTempRepository;
import com.backend.ccasa.service.IEntryOvenTempCrudService;
import com.backend.ccasa.service.IReferenceParameterService;
import com.backend.ccasa.service.impl.support.OvenTempEntryComputation;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryOvenTempCrudService extends AbstractEntityCrudService<EntryOvenTempEntity> implements IEntryOvenTempCrudService {

	private final OvenTempEntryComputation ovenTempEntryComputation;
	private final IReferenceParameterService referenceParameterService;

	public EntryOvenTempCrudService(
		EntryOvenTempRepository repository,
		EntityManager entityManager,
		OvenTempEntryComputation ovenTempEntryComputation,
		IReferenceParameterService referenceParameterService
	) {
		super(repository, entityManager, EntryOvenTempEntity.class, "E_NT_RY_OV_EN_TE_MP");
		this.ovenTempEntryComputation = ovenTempEntryComputation;
		this.referenceParameterService = referenceParameterService;
	}

	@Override
	protected void afterApply(EntryOvenTempEntity entity) {
		ovenTempEntryComputation.apply(entity, referenceParameterService);
	}

	@Override
	protected EntryOvenTempEntity newEntity() {
		return new EntryOvenTempEntity();
	}
}
