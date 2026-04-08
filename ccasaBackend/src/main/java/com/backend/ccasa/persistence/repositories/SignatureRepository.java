package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.SignatureEntity;
import com.backend.ccasa.service.models.enums.SignatureTypeEnum;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface SignatureRepository extends ActiveRepository<SignatureEntity, Long> {

	@Query("select s from SignatureEntity s where s.deletedAt is null and s.entry = :entry")
	List<SignatureEntity> findByEntry(EntryEntity entry);

	boolean existsByEntryAndSignatureTypeAndDeletedAtIsNull(EntryEntity entry, SignatureTypeEnum signatureType);
}
