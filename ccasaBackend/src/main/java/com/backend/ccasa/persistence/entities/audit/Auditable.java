package com.backend.ccasa.persistence.entities.audit;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;

/**
 * Campos de auditoría para todas las entidades (RF trazabilidad, soft delete).
 */
@MappedSuperclass
public abstract class Auditable {

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	@Column(name = "updated_at")
	private Instant updatedAt;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by_user_id")
	private com.backend.ccasa.persistence.entities.UserEntity createdByUser;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "updated_by_user_id")
	private com.backend.ccasa.persistence.entities.UserEntity updatedByUser;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "deleted_by_user_id")
	private com.backend.ccasa.persistence.entities.UserEntity deletedByUser;

	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
	public Instant getDeletedAt() { return deletedAt; }
	public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
	public com.backend.ccasa.persistence.entities.UserEntity getCreatedByUser() { return createdByUser; }
	public void setCreatedByUser(com.backend.ccasa.persistence.entities.UserEntity u) { this.createdByUser = u; }
	public com.backend.ccasa.persistence.entities.UserEntity getUpdatedByUser() { return updatedByUser; }
	public void setUpdatedByUser(com.backend.ccasa.persistence.entities.UserEntity u) { this.updatedByUser = u; }
	public com.backend.ccasa.persistence.entities.UserEntity getDeletedByUser() { return deletedByUser; }
	public void setDeletedByUser(com.backend.ccasa.persistence.entities.UserEntity u) { this.deletedByUser = u; }
}
