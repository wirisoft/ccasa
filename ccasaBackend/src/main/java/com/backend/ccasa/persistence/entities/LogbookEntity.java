package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Bitácora (UI-01: 15 registros code 1–15).
 */
@Entity
@Table(name = "logbook")
public class LogbookEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "logbook_id")
	private Long id;

	@Column(name = "code", nullable = false, unique = true)
	private Integer code;

	@Column(name = "name", nullable = false, length = 150)
	private String name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "max_entries")
	private Integer maxEntries;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Integer getCode() { return code; }
	public void setCode(Integer code) { this.code = code; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public Integer getMaxEntries() { return maxEntries; }
	public void setMaxEntries(Integer maxEntries) { this.maxEntries = maxEntries; }
}
