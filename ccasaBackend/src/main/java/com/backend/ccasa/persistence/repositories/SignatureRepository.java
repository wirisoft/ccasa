package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.SignatureEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SignatureRepository extends JpaRepository<SignatureEntity, Long> {

	@Query("select s from SignatureEntity s where s.deletedAt is null and s.entry = :entry")
	List<SignatureEntity> findByEntry(EntryEntity entry);
}
