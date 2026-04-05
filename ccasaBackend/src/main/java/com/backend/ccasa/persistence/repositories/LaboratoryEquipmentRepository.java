package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.LaboratoryEquipmentEntity;
import java.util.Optional;

public interface LaboratoryEquipmentRepository extends ActiveRepository<LaboratoryEquipmentEntity, Long> {

	Optional<LaboratoryEquipmentEntity> findByDenominationAndDeletedAtIsNull(String denomination);
}
