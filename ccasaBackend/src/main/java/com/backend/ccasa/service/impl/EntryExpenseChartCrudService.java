package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.ReagentJarEntity;
import com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity;
import com.backend.ccasa.persistence.repositories.EntryExpenseChartRepository;
import com.backend.ccasa.persistence.repositories.ReagentJarRepository;
import com.backend.ccasa.service.IEntryExpenseChartCrudService;
import com.backend.ccasa.service.impl.support.CrudEntityMapper;
import com.backend.ccasa.service.impl.support.ExpenseChartConsumptionHelper;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.stereotype.Service;

@Service
public class EntryExpenseChartCrudService extends AbstractEntityCrudService<EntryExpenseChartEntity> implements IEntryExpenseChartCrudService {

	private final ExpenseChartConsumptionHelper expenseChartConsumptionHelper;
	private final ReagentJarRepository reagentJarRepository;

	public EntryExpenseChartCrudService(
		EntryExpenseChartRepository repository,
		EntityManager entityManager,
		ExpenseChartConsumptionHelper expenseChartConsumptionHelper,
		ReagentJarRepository reagentJarRepository
	) {
		super(repository, entityManager, EntryExpenseChartEntity.class, "E_NT_RY_EX_PE_NS_EC_HA_RT");
		this.expenseChartConsumptionHelper = expenseChartConsumptionHelper;
		this.reagentJarRepository = reagentJarRepository;
	}

	@Override
	public CrudResponseDTO create(CrudRequestDTO request) {
		EntryExpenseChartEntity entity = newEntity();
		CrudEntityMapper.apply(getEntityClass(), entity, values(request), getEntityManager());
		ExpenseChartConsumptionHelper.validateNonNegativeAmounts(entity);
		EntryExpenseChartEntity saved = getRepository().save(entity);
		expenseChartConsumptionHelper.applyConsumptionOnCreate(saved, reagentJarRepository);
		return toDto(saved);
	}

	@Override
	public CrudResponseDTO update(Long id, CrudRequestDTO request) {
		EntryExpenseChartEntity entity = requireActive(id);
		BigDecimal prevKcl = entity.getKclUsedG();
		ReagentJarEntity prevJar = entity.getKclJar();
		CrudEntityMapper.apply(getEntityClass(), entity, values(request), getEntityManager());
		ExpenseChartConsumptionHelper.validateNonNegativeAmounts(entity);
		entity.setUpdatedAt(Instant.now());
		EntryExpenseChartEntity saved = getRepository().save(entity);
		expenseChartConsumptionHelper.applyConsumptionOnUpdate(prevKcl, prevJar, saved, reagentJarRepository);
		return toDto(saved);
	}

	@Override
	public void delete(Long id) {
		EntryExpenseChartEntity entity = requireActive(id);
		expenseChartConsumptionHelper.restoreConsumptionOnDelete(entity, reagentJarRepository);
		super.delete(id);
	}

	@Override
	protected EntryExpenseChartEntity newEntity() {
		return new EntryExpenseChartEntity();
	}
}
