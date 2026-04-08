package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.repositories.EntryRepository;
import com.backend.ccasa.service.IEntryCrudService;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class EntryCrudService extends AbstractEntityCrudService<EntryEntity> implements IEntryCrudService {

	public EntryCrudService(EntryRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryEntity.class, "ENTRY");
	}

	@Override
	protected EntryEntity newEntity() {
		return new EntryEntity();
	}

	@Override
	protected List<String> requiredFields() {
		return List.of("folioId", "logbookId", "userId");
	}

	@Override
	public CrudResponseDTO update(Long id, CrudRequestDTO request) {
		EntryEntity entity = requireActive(id);
		if (entity.getStatus() == EntryStatusEnum.Locked) {
			throw new BusinessRuleException("ENTRY_LOCKED",
					"No se puede editar una entrada en estado Locked.");
		}
		return super.update(id, request);
	}

	@Override
	public void delete(Long id) {
		EntryEntity entity = requireActive(id);
		if (entity.getStatus() == EntryStatusEnum.Locked) {
			throw new BusinessRuleException("ENTRY_LOCKED",
					"No se puede eliminar una entrada en estado Locked.");
		}
		super.delete(id);
	}
}
