package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntryConductivityRepository extends ActiveRepository<EntryConductivityEntity, Long> {

	@Query(
		"select ec from EntryConductivityEntity ec "
			+ "join ec.entry e "
			+ "left join e.user createdBy "
			+ "left join ec.reviewerUser reviewer "
			+ "where ec.deletedAt is null "
			+ "and (:folio is null or upper(coalesce(ec.displayFolio, '')) like upper(concat('%', :folio, '%'))) "
			+ "and (:fromDate is null or e.recordedAt >= :fromDate) "
			+ "and (:toDate is null or e.recordedAt <= :toDate) "
			+ "and (:type is null or ec.type = :type) "
			+ "and (:status is null or e.status = :status) "
			+ "and (:createdByUserId is null or createdBy.id = :createdByUserId) "
			+ "and (:reviewerUserId is null or reviewer.id = :reviewerUserId) "
			+ "order by e.recordedAt desc nulls last, ec.id desc"
	)
	List<EntryConductivityEntity> searchRecords(
		@Param("folio") String folio,
		@Param("fromDate") Instant fromDate,
		@Param("toDate") Instant toDate,
		@Param("type") com.backend.ccasa.service.models.enums.ConductivityTypeEnum type,
		@Param("status") com.backend.ccasa.service.models.enums.EntryStatusEnum status,
		@Param("createdByUserId") Long createdByUserId,
		@Param("reviewerUserId") Long reviewerUserId
	);
}
