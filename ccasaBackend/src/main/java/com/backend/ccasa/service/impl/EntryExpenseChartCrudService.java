package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class EntryExpenseChartCrudService extends AbstractEntityCrudService<EntryExpenseChartEntity> {

	public EntryExpenseChartCrudService(EntityManager entityManager) {
		super(entityManager, EntryExpenseChartEntity.class, id -> new ResourceNotFoundException("ENTRY_EXPENSE_CHART", id));
	}
}
