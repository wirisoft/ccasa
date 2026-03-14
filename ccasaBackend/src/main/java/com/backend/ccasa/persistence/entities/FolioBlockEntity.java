package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Bloque de folios (RF-03: al folio 200 nuevo bloque identificador ej. 1-MT).
 */
@Entity
@Table(name = "folio_block")
public class FolioBlockEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "folio_block_id")
	private Long id;

	@Column(name = "identifier", nullable = false, length = 50)
	private String identifier;

	@Column(name = "start_number", nullable = false)
	private Integer startNumber;

	@Column(name = "end_number", nullable = false)
	private Integer endNumber;

	@Column(name = "cover_generated", nullable = false)
	private boolean coverGenerated = false;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getIdentifier() { return identifier; }
	public void setIdentifier(String identifier) { this.identifier = identifier; }
	public Integer getStartNumber() { return startNumber; }
	public void setStartNumber(Integer startNumber) { this.startNumber = startNumber; }
	public Integer getEndNumber() { return endNumber; }
	public void setEndNumber(Integer endNumber) { this.endNumber = endNumber; }
	public boolean isCoverGenerated() { return coverGenerated; }
	public void setCoverGenerated(boolean coverGenerated) { this.coverGenerated = coverGenerated; }
}
