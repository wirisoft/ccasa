package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.IResourceCrudService;
import com.backend.ccasa.services.models.dtos.CrudRequestDTO;
import com.backend.ccasa.services.models.dtos.CrudResponseDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public abstract class AbstractEntityCrudService<E extends Auditable> implements IResourceCrudService {

	private final EntityManager entityManager;
	private final Class<E> entityClass;
	private final Function<Long, RuntimeException> notFoundFactory;

	protected AbstractEntityCrudService(EntityManager entityManager, Class<E> entityClass, Function<Long, RuntimeException> notFoundFactory) {
		this.entityManager = entityManager;
		this.entityClass = entityClass;
		this.notFoundFactory = notFoundFactory;
	}

	@Override
	public CrudResponseDTO create(CrudRequestDTO request) {
		E entity = newEntityInstance();
		applyRequest(entity, request.values());
		entityManager.persist(entity);
		entityManager.flush();
		return toDto(entity);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CrudResponseDTO> findAllActive() {
		TypedQuery<E> query = entityManager.createQuery(
			"select e from " + entityClass.getSimpleName() + " e where e.deletedAt is null",
			entityClass
		);
		return query.getResultList().stream().map(this::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public CrudResponseDTO findById(Long id) {
		return toDto(requireActive(id));
	}

	@Override
	public CrudResponseDTO update(Long id, CrudRequestDTO request) {
		E entity = requireActive(id);
		applyRequest(entity, request.values());
		entity.setUpdatedAt(Instant.now());
		entityManager.flush();
		return toDto(entity);
	}

	@Override
	public void delete(Long id) {
		E entity = requireActive(id);
		entity.setDeletedAt(Instant.now());
		entityManager.flush();
	}

	private E requireActive(Long id) {
		TypedQuery<E> query = entityManager.createQuery(
			"select e from " + entityClass.getSimpleName() + " e where e.id = :id and e.deletedAt is null",
			entityClass
		);
		query.setParameter("id", id);
		List<E> result = query.getResultList();
		if (result.isEmpty()) {
			throw notFoundFactory.apply(id);
		}
		return result.getFirst();
	}

	private E newEntityInstance() {
		try {
			return entityClass.getDeclaredConstructor().newInstance();
		}
		catch (Exception ex) {
			throw new IllegalStateException("Cannot instantiate " + entityClass.getSimpleName(), ex);
		}
	}

	private void applyRequest(E entity, Map<String, Object> values) {
		if (values == null) {
			return;
		}
		for (Field field : allFields(entityClass)) {
			field.setAccessible(true);
			String name = field.getName();
			if ("id".equals(name) || "createdAt".equals(name) || "updatedAt".equals(name) || "deletedAt".equals(name)) {
				continue;
			}
			if (isRelationField(field)) {
				String relationKey = name + "Id";
				if (values.containsKey(relationKey)) {
					Object relationIdValue = values.get(relationKey);
					setField(entity, field, relationIdValue == null ? null : findActiveRelation(field.getType(), Long.valueOf(String.valueOf(relationIdValue))));
				}
				continue;
			}
			if (values.containsKey(name)) {
				setField(entity, field, convertValue(values.get(name), field.getType()));
			}
		}
	}

	private Object findActiveRelation(Class<?> relationType, Long id) {
		List<?> result = entityManager.createQuery(
				"select e from " + relationType.getSimpleName() + " e where e.id = :id and e.deletedAt is null",
				relationType
			)
			.setParameter("id", id)
			.getResultList();
		if (result.isEmpty()) {
			throw new IllegalArgumentException("Related entity not found: " + relationType.getSimpleName() + " id=" + id);
		}
		return result.getFirst();
	}

	private CrudResponseDTO toDto(E entity) {
		Map<String, Object> payload = new LinkedHashMap<>();
		for (Field field : allFields(entityClass)) {
			field.setAccessible(true);
			if ("id".equals(field.getName())) {
				continue;
			}
			Object value = getField(entity, field);
			if (isRelationField(field)) {
				payload.put(field.getName() + "Id", relationId(value));
			}
			else {
				payload.put(field.getName(), value);
			}
		}
		return new CrudResponseDTO((Long) getField(entity, getIdField()), payload);
	}

	private List<Field> allFields(Class<?> type) {
		List<Field> fields = new ArrayList<>();
		Class<?> current = type;
		while (current != null && current != Object.class) {
			for (Field field : current.getDeclaredFields()) {
				fields.add(field);
			}
			current = current.getSuperclass();
		}
		return fields;
	}

	private Field getIdField() {
		try {
			return entityClass.getDeclaredField("id");
		}
		catch (NoSuchFieldException ex) {
			throw new IllegalStateException("Entity without id field: " + entityClass.getSimpleName(), ex);
		}
	}

	private Object getField(Object target, Field field) {
		try {
			field.setAccessible(true);
			return field.get(target);
		}
		catch (IllegalAccessException ex) {
			throw new IllegalStateException("Cannot read field " + field.getName(), ex);
		}
	}

	private void setField(Object target, Field field, Object value) {
		try {
			field.setAccessible(true);
			field.set(target, value);
		}
		catch (IllegalAccessException ex) {
			throw new IllegalStateException("Cannot write field " + field.getName(), ex);
		}
	}

	private boolean isRelationField(Field field) {
		String pkg = field.getType().getPackageName();
		return pkg.startsWith("com.backend.ccasa.persistence.entities");
	}

	private Long relationId(Object relation) {
		if (relation == null) {
			return null;
		}
		try {
			return (Long) relation.getClass().getMethod("getId").invoke(relation);
		}
		catch (Exception ex) {
			return null;
		}
	}

	private Object convertValue(Object raw, Class<?> targetType) {
		if (raw == null) {
			return null;
		}
		if (targetType.isAssignableFrom(raw.getClass())) {
			return raw;
		}
		if (targetType == String.class) {
			return String.valueOf(raw);
		}
		if (targetType == Integer.class || targetType == int.class) {
			return Integer.valueOf(String.valueOf(raw));
		}
		if (targetType == Long.class || targetType == long.class) {
			return Long.valueOf(String.valueOf(raw));
		}
		if (targetType == Boolean.class || targetType == boolean.class) {
			return Boolean.valueOf(String.valueOf(raw));
		}
		if (targetType == BigDecimal.class) {
			return new BigDecimal(String.valueOf(raw));
		}
		if (targetType == Instant.class) {
			return Instant.parse(String.valueOf(raw));
		}
		if (targetType == LocalDate.class) {
			return LocalDate.parse(String.valueOf(raw));
		}
		if (targetType == LocalTime.class) {
			return LocalTime.parse(String.valueOf(raw));
		}
		if (targetType.isEnum()) {
			@SuppressWarnings({"unchecked", "rawtypes"})
			Class<? extends Enum> enumType = (Class<? extends Enum>) targetType;
			return Enum.valueOf(enumType, String.valueOf(raw));
		}
		return raw;
	}
}
