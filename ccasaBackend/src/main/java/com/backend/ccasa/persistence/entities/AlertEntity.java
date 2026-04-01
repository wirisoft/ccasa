package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.models.enums.AlertStatusEnum;
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
 * Alerta (RF-06, RF-09, UI-02: Critical Oven, etc.).
 */
@Entity
@Table(name = "alert")
public class AlertEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "alert_id")
	private Long id;

	@Column(name = "type", length = 80)
	private String type;

	@Column(name = "message", columnDefinition = "TEXT")
	private String message;

	@Column(name = "generated_at")
	private Instant generatedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "target_user_id")
	private UserEntity targetUser;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20)
	private AlertStatusEnum status = AlertStatusEnum.Pending;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getType() { return type; }
	public void setType(String type) { this.type = type; }
	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }
	public Instant getGeneratedAt() { return generatedAt; }
	public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
	public UserEntity getTargetUser() { return targetUser; }
	public void setTargetUser(UserEntity targetUser) { this.targetUser = targetUser; }
	public AlertStatusEnum getStatus() { return status; }
	public void setStatus(AlertStatusEnum status) { this.status = status; }
}

