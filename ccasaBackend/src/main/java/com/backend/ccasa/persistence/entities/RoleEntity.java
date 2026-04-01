package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Rol de usuario (RF-01: Admin, Analyst, Sampler, Supervisor).
 */
@Entity
@Table(name = "role")
public class RoleEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "role_id")
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "name", nullable = false, unique = true, length = 50)
	private RoleNameEnum name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public RoleNameEnum getName() { return name; }
	public void setName(RoleNameEnum name) { this.name = name; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
}

