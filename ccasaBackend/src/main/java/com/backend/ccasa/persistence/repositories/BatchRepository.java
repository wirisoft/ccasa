package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.entities.ReagentEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface BatchRepository extends ActiveRepository<BatchEntity, Long> {

	@Query("select b from BatchEntity b where b.deletedAt is null and b.reagent = :reagent order by b.generatedAt desc")
	List<BatchEntity> findByReagent(ReagentEntity reagent);

	@Query("select b from BatchEntity b where b.deletedAt is null and b.batchCode = :code")
	Optional<BatchEntity> findByBatchCode(String code);
}
