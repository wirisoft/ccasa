package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.LaboratoryEquipmentEntity;
import java.util.Optional;

public interface LaboratoryEquipmentRepository extends ActiveRepository<LaboratoryEquipmentEntity, Long> {

	Optional<LaboratoryEquipmentEntity> findByDenominationAndDeletedAtIsNull(String denomination);

	/** Por denominación sin filtrar borrado lógico (denominación única en BD). */
	Optional<LaboratoryEquipmentEntity> findByDenomination(String denomination);
}
