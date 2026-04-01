package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface RoleRepository extends ActiveRepository<RoleEntity, Long> {

	@Query("select r from RoleEntity r where r.deletedAt is null and r.name = :name")
	Optional<RoleEntity> findByName(RoleNameEnum name);
}

