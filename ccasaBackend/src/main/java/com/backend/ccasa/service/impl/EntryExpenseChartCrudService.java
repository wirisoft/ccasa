package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity;
import com.backend.ccasa.persistence.repositories.EntryExpenseChartRepository;
import com.backend.ccasa.service.IEntryExpenseChartCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryExpenseChartCrudService extends AbstractEntityCrudService<EntryExpenseChartEntity> implements IEntryExpenseChartCrudService {

	public EntryExpenseChartCrudService(EntryExpenseChartRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryExpenseChartEntity.class, "E_NT_RY_EX_PE_NS_EC_HA_RT");
	}

	@Override
	protected EntryExpenseChartEntity newEntity() {
		return new EntryExpenseChartEntity();
	}
}
