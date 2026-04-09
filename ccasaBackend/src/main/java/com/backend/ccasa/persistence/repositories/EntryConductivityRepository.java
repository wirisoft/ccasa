package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EntryConductivityRepository extends ActiveRepository<EntryConductivityEntity, Long> {

	/**
	 * Consulta nativa PostgreSQL: evita el binding de {@code :folio} nulo como {@code bytea} que rompía
	 * {@code upper()}/{@code lower()} en JPQL con el driver JDBC.
	 */
	@Query(
		nativeQuery = true,
		value = """
			SELECT ec.*
			FROM entry_conductivity ec
			INNER JOIN entry e ON e.entry_id = ec.entry_id
			LEFT JOIN app_user u ON u.user_id = e.user_id
			LEFT JOIN app_user ru ON ru.user_id = ec.reviewer_user_id
			WHERE ec.deleted_at IS NULL
			AND (:folio IS NULL OR lower(coalesce(ec.display_folio, '')) LIKE lower('%' || CAST(:folio AS text) || '%'))
			AND (:fromDate IS NULL OR e.recorded_at >= CAST(:fromDate AS timestamptz))
			AND (:toDate IS NULL OR e.recorded_at <= CAST(:toDate AS timestamptz))
			AND (:type IS NULL OR ec.type = :type)
			AND (:status IS NULL OR e.status = :status)
			AND (:createdByUserId IS NULL OR u.user_id = :createdByUserId)
			AND (:reviewerUserId IS NULL OR ru.user_id = :reviewerUserId)
			ORDER BY e.recorded_at DESC NULLS LAST, ec.conductivity_entry_id DESC
			"""
	)
	List<EntryConductivityEntity> searchRecords(
		@Param("folio") String folio,
		@Param("fromDate") Instant fromDate,
		@Param("toDate") Instant toDate,
		@Param("type") String type,
		@Param("status") String status,
		@Param("createdByUserId") Long createdByUserId,
		@Param("reviewerUserId") Long reviewerUserId
	);
}
