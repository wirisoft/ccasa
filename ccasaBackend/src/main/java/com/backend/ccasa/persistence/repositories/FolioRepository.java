package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface FolioRepository extends ActiveRepository<FolioEntity, Long> {

	@Query("select f from FolioEntity f where f.deletedAt is null and f.logbook = :logbook and f.folioNumber = :folioNumber")
	Optional<FolioEntity> findByLogbookAndFolioNumber(LogbookEntity logbook, Integer folioNumber);

	@Query("select f from FolioEntity f where f.deletedAt is null and f.logbook = :logbook order by f.folioNumber")
	List<FolioEntity> findByLogbook(LogbookEntity logbook);
}
