package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends ActiveRepository<UserEntity, Long> {

	@Query("select u from UserEntity u where u.deletedAt is null and u.email = :email")
	Optional<UserEntity> findByEmail(String email);

	@Query(
		"select u from UserEntity u "
			+ "where u.deletedAt is null and u.active = true and upper(coalesce(u.nomenclature, '')) = upper(:nomenclature) "
			+ "order by u.id"
	)
	List<UserEntity> findActiveByNomenclature(String nomenclature);

	@Query("SELECT u FROM UserEntity u WHERE u.role.name = :roleName AND u.deletedAt IS NULL ORDER BY u.id")
	List<UserEntity> findByRoleNameAndDeletedAtIsNull(@Param("roleName") RoleNameEnum roleName);
}
