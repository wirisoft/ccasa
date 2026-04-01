package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.models.enums.SignatureTypeEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Firma sobre una entrada (RF-02: supervisor distinto del autor).
 */
@Entity
@Table(name = "signature")
public class SignatureEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "signature_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "supervisor_user_id", nullable = false)
	private UserEntity supervisorUser;

	@Column(name = "signed_at")
	private Instant signedAt;

	@Enumerated(EnumType.STRING)
	@Column(name = "signature_type", length = 30)
	private SignatureTypeEnum signatureType;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public UserEntity getSupervisorUser() { return supervisorUser; }
	public void setSupervisorUser(UserEntity supervisorUser) { this.supervisorUser = supervisorUser; }
	public Instant getSignedAt() { return signedAt; }
	public void setSignedAt(Instant signedAt) { this.signedAt = signedAt; }
	public SignatureTypeEnum getSignatureType() { return signatureType; }
	public void setSignatureType(SignatureTypeEnum signatureType) { this.signatureType = signatureType; }
}

