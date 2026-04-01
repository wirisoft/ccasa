package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface EntryDistilledWaterRepository extends ActiveRepository<EntryDistilledWaterEntity, Long> {

	@Query("select d from EntryDistilledWaterEntity d where d.deletedAt is null and d.entry = :entry")
	Optional<EntryDistilledWaterEntity> findByEntry(EntryEntity entry);
}
