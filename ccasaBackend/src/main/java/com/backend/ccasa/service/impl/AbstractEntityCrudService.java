package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.ResourceNotFoundException;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.persistence.repositories.ActiveRepository;
import com.backend.ccasa.service.ITypedCrudService;
import com.backend.ccasa.service.impl.support.CrudEntityMapper;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public abstract class AbstractEntityCrudService<E extends Auditable> implements ITypedCrudService {

	private final ActiveRepository<E, Long> repository;
	private final EntityManager entityManager;
	private final Class<E> entityClass;
	private final String resourceCode;

	protected AbstractEntityCrudService(
		ActiveRepository<E, Long> repository,
		EntityManager entityManager,
		Class<E> entityClass,
		String resourceCode
	) {
		this.repository = repository;
		this.entityManager = entityManager;
		this.entityClass = entityClass;
		this.resourceCode = toResourceCode(entityClass);
	}

	protected abstract E newEntity();

	@Override
	public CrudResponseDTO create(CrudRequestDTO request) {
		E entity = newEntity();
		CrudEntityMapper.apply(entityClass, entity, values(request), entityManager);
		E saved = repository.save(entity);
		return toDto(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CrudResponseDTO> findAllActive() {
		return repository.findAllByDeletedAtIsNull().stream().map(this::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public CrudResponseDTO findById(Long id) {
		return toDto(requireActive(id));
	}

	@Override
	public CrudResponseDTO update(Long id, CrudRequestDTO request) {
		E entity = requireActive(id);
		CrudEntityMapper.apply(entityClass, entity, values(request), entityManager);
		entity.setUpdatedAt(Instant.now());
		E saved = repository.save(entity);
		return toDto(saved);
	}

	@Override
	public void delete(Long id) {
		E entity = requireActive(id);
		entity.setDeletedAt(Instant.now());
		repository.save(entity);
	}

	private E requireActive(Long id) {
		return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException(resourceCode, id));
	}

	private CrudResponseDTO toDto(E entity) {
		return new CrudResponseDTO(extractId(entity), CrudEntityMapper.toValues(entityClass, entity));
	}

	private Long extractId(E entity) {
		if (entity instanceof com.backend.ccasa.persistence.entities.RoleEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.UserEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.LogbookEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.FolioBlockEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.FolioEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.EntryEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.AlertEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.SignatureEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.ReagentEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.BatchEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.ReagentJarEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.SolutionEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.SupplyEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryDryingOvenEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.entry.EntryFlaskTreatmentEntity e) return e.getId();
		return null;
	}

	private Map<String, Object> values(CrudRequestDTO request) {
		return request == null || request.values() == null ? Map.of() : request.values();
	}

	private String toResourceCode(Class<E> type) {
		String base = type.getSimpleName().replace("Entity", "");
		return base.replaceAll("([a-z])([A-Z])", "$1_$2").toUpperCase();
	}
}
