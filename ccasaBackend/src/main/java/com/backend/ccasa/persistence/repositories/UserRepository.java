package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.UserEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

	@Query("select u from UserEntity u where u.deletedAt is null and u.email = :email")
	Optional<UserEntity> findByEmail(String email);
}
