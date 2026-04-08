package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.LaboratoryEquipmentEntity;
import com.backend.ccasa.persistence.repositories.LaboratoryEquipmentRepository;
import com.backend.ccasa.service.ILaboratoryEquipmentCrudService;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

@Service
public class LaboratoryEquipmentCrudService extends AbstractEntityCrudService<LaboratoryEquipmentEntity>
		implements ILaboratoryEquipmentCrudService {

	public LaboratoryEquipmentCrudService(LaboratoryEquipmentRepository repository, EntityManager entityManager) {
		super(repository, entityManager, LaboratoryEquipmentEntity.class, "LABORATORY_EQUIPMENT");
	}

	@Override
	protected LaboratoryEquipmentEntity newEntity() {
		return new LaboratoryEquipmentEntity();
	}
}
