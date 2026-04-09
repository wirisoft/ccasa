package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.ReferenceParameterEntity;
import java.util.Optional;

public interface ReferenceParameterRepository extends ActiveRepository<ReferenceParameterEntity, Long> {

	Optional<ReferenceParameterEntity> findByCodeAndDeletedAtIsNull(String code);

	/** Por código sin filtrar borrado lógico (código único en BD). */
	Optional<ReferenceParameterEntity> findByCode(String code);
}
