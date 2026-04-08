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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

	/**
	 * Hook tras mapear DTO → entidad (create/update). Las subclases pueden recalcular campos derivados.
	 */
	protected void afterApply(E entity) {
	}

	/**
	 * Campos obligatorios para create. Las subclases pueden override para validar.
	 * @return lista de nombres de campo requeridos (vacía por default).
	 */
	protected List<String> requiredFields() {
		return Collections.emptyList();
	}

	protected ActiveRepository<E, Long> getRepository() {
		return repository;
	}

	protected EntityManager getEntityManager() {
		return entityManager;
	}

	protected Class<E> getEntityClass() {
		return entityClass;
	}

	@Override
	public CrudResponseDTO create(CrudRequestDTO request) {
		Map<String, Object> vals = values(request);
		validateRequired(vals);
		E entity = newEntity();
		CrudEntityMapper.apply(entityClass, entity, vals, entityManager);
		afterApply(entity);
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
	public Page<CrudResponseDTO> findAllActive(Pageable pageable) {
		return repository.findAllByDeletedAtIsNull(pageable).map(this::toDto);
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
		afterApply(entity);
		E saved = repository.save(entity);
		return toDto(saved);
	}

	@Override
	public void delete(Long id) {
		E entity = requireActive(id);
		entity.setDeletedAt(Instant.now());
		repository.save(entity);
	}

	@Override
	public void restore(Long id) {
		E entity = repository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException(resourceCode, id));
		entity.setDeletedAt(null);
		entity.setUpdatedAt(Instant.now());
		repository.save(entity);
	}

	protected E requireActive(Long id) {
		return repository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new ResourceNotFoundException(resourceCode, id));
	}

	protected CrudResponseDTO toDto(E entity) {
		return new CrudResponseDTO(extractId(entity), CrudEntityMapper.toValues(entityClass, entity));
	}

	private void validateRequired(Map<String, Object> vals) {
		List<String> required = requiredFields();
		if (required.isEmpty()) {
			return;
		}
		List<String> missing = new ArrayList<>();
		for (String field : required) {
			if (!vals.containsKey(field) || vals.get(field) == null) {
				missing.add(field);
			}
		}
		if (!missing.isEmpty()) {
			throw new IllegalArgumentException("Campos obligatorios faltantes: " + String.join(", ", missing));
		}
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
		if (entity instanceof com.backend.ccasa.persistence.entities.LaboratoryEquipmentEntity e) return e.getId();
		if (entity instanceof com.backend.ccasa.persistence.entities.ReferenceParameterEntity e) return e.getId();
		return null;
	}

	protected Map<String, Object> values(CrudRequestDTO request) {
		return request == null || request.values() == null ? Map.of() : request.values();
	}

	private String toResourceCode(Class<E> type) {
		String base = type.getSimpleName().replace("Entity", "");
		return base.replaceAll("([a-z])([A-Z])", "$1_$2").toUpperCase();
	}
}
