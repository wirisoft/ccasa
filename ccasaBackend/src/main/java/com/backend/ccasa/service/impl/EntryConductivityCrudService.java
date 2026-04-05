package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.persistence.repositories.EntryConductivityRepository;
import com.backend.ccasa.service.IEntryConductivityCrudService;
import com.backend.ccasa.service.IReferenceParameterService;
import com.backend.ccasa.service.impl.support.ConductivityEntryComputation;
import com.backend.ccasa.service.impl.support.ConductivityHighKclComputation;
import com.backend.ccasa.service.impl.support.ConductivityLowKclComputation;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryConductivityCrudService extends AbstractEntityCrudService<EntryConductivityEntity> implements IEntryConductivityCrudService {

	private final ConductivityHighKclComputation conductivityHighKclComputation;
	private final ConductivityLowKclComputation conductivityLowKclComputation;
	private final ConductivityEntryComputation conductivityEntryComputation;
	private final IReferenceParameterService referenceParameterService;

	public EntryConductivityCrudService(
		EntryConductivityRepository repository,
		EntityManager entityManager,
		ConductivityHighKclComputation conductivityHighKclComputation,
		ConductivityLowKclComputation conductivityLowKclComputation,
		ConductivityEntryComputation conductivityEntryComputation,
		IReferenceParameterService referenceParameterService
	) {
		super(repository, entityManager, EntryConductivityEntity.class, "E_NT_RY_CO_ND_UC_TI_VI_TY");
		this.conductivityHighKclComputation = conductivityHighKclComputation;
		this.conductivityLowKclComputation = conductivityLowKclComputation;
		this.conductivityEntryComputation = conductivityEntryComputation;
		this.referenceParameterService = referenceParameterService;
	}

	@Override
	protected void afterApply(EntryConductivityEntity entity) {
		conductivityHighKclComputation.apply(entity, referenceParameterService);
		conductivityLowKclComputation.apply(entity, referenceParameterService);
		conductivityEntryComputation.apply(entity, referenceParameterService);
	}

	@Override
	protected EntryConductivityEntity newEntity() {
		return new EntryConductivityEntity();
	}
}
