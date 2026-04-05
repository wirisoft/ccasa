package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity;
import com.backend.ccasa.persistence.repositories.EntrySolutionPrepRepository;
import com.backend.ccasa.service.IEntrySolutionPrepCrudService;
import com.backend.ccasa.service.impl.support.SolutionPrepEntryComputation;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntrySolutionPrepCrudService extends AbstractEntityCrudService<EntrySolutionPrepEntity> implements IEntrySolutionPrepCrudService {

	private final SolutionPrepEntryComputation solutionPrepEntryComputation;

	public EntrySolutionPrepCrudService(
		EntrySolutionPrepRepository repository,
		EntityManager entityManager,
		SolutionPrepEntryComputation solutionPrepEntryComputation
	) {
		super(repository, entityManager, EntrySolutionPrepEntity.class, "E_NT_RY_SO_LU_TI_ON_PR_EP");
		this.solutionPrepEntryComputation = solutionPrepEntryComputation;
	}

	@Override
	protected void afterApply(EntrySolutionPrepEntity entity) {
		solutionPrepEntryComputation.apply(entity);
	}

	@Override
	protected EntrySolutionPrepEntity newEntity() {
		return new EntrySolutionPrepEntity();
	}
}
