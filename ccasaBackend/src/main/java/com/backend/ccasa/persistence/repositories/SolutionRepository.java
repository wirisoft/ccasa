package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.SolutionEntity;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface SolutionRepository extends ActiveRepository<SolutionEntity, Long> {

	@Query("select s from SolutionEntity s where s.deletedAt is null order by s.name")
	List<SolutionEntity> findAllActive();
}
