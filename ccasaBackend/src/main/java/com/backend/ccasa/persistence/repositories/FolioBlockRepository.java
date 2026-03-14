package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.FolioBlockEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FolioBlockRepository extends JpaRepository<FolioBlockEntity, Long> {

	@Query("select f from FolioBlockEntity f where f.deletedAt is null order by f.id desc")
	List<FolioBlockEntity> findAllActive();
}
