package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EntryConductivityRepository
	extends ActiveRepository<EntryConductivityEntity, Long>, JpaSpecificationExecutor<EntryConductivityEntity> {
}
