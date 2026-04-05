package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.LogbookEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface LogbookRepository extends ActiveRepository<LogbookEntity, Long> {

	@Query("select l from LogbookEntity l where l.deletedAt is null order by l.code")
	List<LogbookEntity> findAllActive();

	Optional<LogbookEntity> findByCodeAndDeletedAtIsNull(Integer code);
}
