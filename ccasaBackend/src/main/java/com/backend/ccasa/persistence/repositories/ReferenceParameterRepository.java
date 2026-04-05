package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.ReferenceParameterEntity;
import java.util.Optional;

public interface ReferenceParameterRepository extends ActiveRepository<ReferenceParameterEntity, Long> {

	Optional<ReferenceParameterEntity> findByCodeAndDeletedAtIsNull(String code);
}
