package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.AlertEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AlertRepository extends JpaRepository<AlertEntity, Long> {

	@Query("select a from AlertEntity a where a.deletedAt is null and a.targetUser = :user and a.status = 'Pending' order by a.generatedAt desc")
	List<AlertEntity> findPendingByTargetUser(UserEntity user);
}
