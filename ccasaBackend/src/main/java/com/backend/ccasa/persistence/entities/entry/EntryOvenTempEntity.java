package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
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
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Temperatura horno (RF-06: corrected = raw−1, rango 103–107; UI-02 alerta 3+ veces 107).
 */
@Entity
@Table(name = "entry_oven_temp")
public class EntryOvenTempEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "oven_temp_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@Column(name = "raw_temperature", precision = 5, scale = 2)
	private BigDecimal rawTemperature;

	@Column(name = "corrected_temperature", precision = 5, scale = 2)
	private BigDecimal correctedTemperature;

	@Column(name = "reading_number")
	private Integer readingNumber;

	@Column(name = "recorded_at")
	private Instant recordedAt;

	@Column(name = "in_range")
	private Boolean inRange;

	@Column(name = "is_maintenance")
	private Boolean isMaintenance;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public BigDecimal getRawTemperature() { return rawTemperature; }
	public void setRawTemperature(BigDecimal rawTemperature) { this.rawTemperature = rawTemperature; }
	public BigDecimal getCorrectedTemperature() { return correctedTemperature; }
	public void setCorrectedTemperature(BigDecimal correctedTemperature) { this.correctedTemperature = correctedTemperature; }
	public Integer getReadingNumber() { return readingNumber; }
	public void setReadingNumber(Integer readingNumber) { this.readingNumber = readingNumber; }
	public Instant getRecordedAt() { return recordedAt; }
	public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
	public Boolean getInRange() { return inRange; }
	public void setInRange(Boolean inRange) { this.inRange = inRange; }
	public Boolean getIsMaintenance() { return isMaintenance; }
	public void setIsMaintenance(Boolean isMaintenance) { this.isMaintenance = isMaintenance; }
}
