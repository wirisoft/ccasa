package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface EntryRepository extends ActiveRepository<EntryEntity, Long> {

	@Query("select e from EntryEntity e where e.deletedAt is null and e.folio = :folio order by e.recordedAt desc nulls last, e.id desc")
	List<EntryEntity> findByFolio(FolioEntity folio);

	@Query("select e from EntryEntity e where e.deletedAt is null and e.logbook = :logbook order by e.recordedAt desc nulls last, e.id desc")
	List<EntryEntity> findByLogbook(LogbookEntity logbook);
}
