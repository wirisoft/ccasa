package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "app_user")
public class UserEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Long id;

	@Column(name = "first_name", nullable = false, length = 100)
	private String firstName;

	@Column(name = "last_name", nullable = false, length = 100)
	private String lastName;

	@Column(name = "email", nullable = false, unique = true, length = 150)
	private String email;

	@Column(name = "password_hash", columnDefinition = "TEXT")
	private String passwordHash;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "role_id", nullable = false)
	private RoleEntity role;

	@Column(name = "is_active", nullable = false)
	private boolean active = true;

	@Column(name = "nomenclature", length = 20)
	private String nomenclature;

	@Column(name = "signature_file_name", length = 255)
	private String signatureFileName;

	@Column(name = "signature_content_type", length = 100)
	private String signatureContentType;

	@Column(name = "signature_storage_path", length = 500)
	private String signatureStoragePath;

	@Column(name = "signature_uploaded_at")
	private Instant signatureUploadedAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getFirstName() { return firstName; }
	public void setFirstName(String firstName) { this.firstName = firstName; }
	public String getLastName() { return lastName; }
	public void setLastName(String lastName) { this.lastName = lastName; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String getPasswordHash() { return passwordHash; }
	public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
	public RoleEntity getRole() { return role; }
	public void setRole(RoleEntity role) { this.role = role; }
	public boolean isActive() { return active; }
	public void setActive(boolean active) { this.active = active; }
	public String getNomenclature() { return nomenclature; }
	public void setNomenclature(String nomenclature) { this.nomenclature = nomenclature; }
	public String getSignatureFileName() { return signatureFileName; }
	public void setSignatureFileName(String signatureFileName) { this.signatureFileName = signatureFileName; }
	public String getSignatureContentType() { return signatureContentType; }
	public void setSignatureContentType(String signatureContentType) { this.signatureContentType = signatureContentType; }
	public String getSignatureStoragePath() { return signatureStoragePath; }
	public void setSignatureStoragePath(String signatureStoragePath) { this.signatureStoragePath = signatureStoragePath; }
	public Instant getSignatureUploadedAt() { return signatureUploadedAt; }
	public void setSignatureUploadedAt(Instant signatureUploadedAt) { this.signatureUploadedAt = signatureUploadedAt; }
}
