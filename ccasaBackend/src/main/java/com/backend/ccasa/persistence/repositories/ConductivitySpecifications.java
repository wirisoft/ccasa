package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class ConductivitySpecifications {

	private ConductivitySpecifications() {
	}

	public static Specification<EntryConductivityEntity> search(
		String folio,
		Instant fromDate,
		Instant toDate,
		ConductivityTypeEnum type,
		EntryStatusEnum status,
		Long createdByUserId,
		Long reviewerUserId
	) {
		return (Root<EntryConductivityEntity> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.isNull(root.get("deletedAt")));

			Join<EntryConductivityEntity, EntryEntity> entry = root.join("entry", JoinType.INNER);

			if (folio != null && !folio.isBlank()) {
				Expression<String> display = cb.coalesce(root.get("displayFolio"), cb.literal(""));
				predicates.add(cb.like(cb.lower(display), "%" + folio.toLowerCase() + "%"));
			}

			if (fromDate != null) {
				predicates.add(cb.greaterThanOrEqualTo(entry.get("recordedAt"), fromDate));
			}
			if (toDate != null) {
				predicates.add(cb.lessThanOrEqualTo(entry.get("recordedAt"), toDate));
			}

			if (type != null) {
				predicates.add(cb.equal(root.get("type"), type));
			}

			if (status != null) {
				predicates.add(cb.equal(entry.get("status"), status));
			}

			if (createdByUserId != null) {
				Join<EntryEntity, UserEntity> user = entry.join("user", JoinType.INNER);
				predicates.add(cb.equal(user.get("id"), createdByUserId));
			}

			if (reviewerUserId != null) {
				Join<EntryConductivityEntity, UserEntity> reviewer = root.join("reviewerUser", JoinType.INNER);
				predicates.add(cb.equal(reviewer.get("id"), reviewerUserId));
			}

			query.orderBy(
				cb.desc(cb.coalesce(entry.get("recordedAt"), cb.literal(Instant.EPOCH))),
				cb.desc(root.get("id"))
			);

			return cb.and(predicates.toArray(Predicate[]::new));
		};
	}
}
