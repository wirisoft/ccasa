package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
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

/**
 * Agua destilada (RF-08: 3 lecturas pH/CE → promedios, is_acceptable).
 */
@Entity
@Table(name = "entry_distilled_water")
public class EntryDistilledWaterEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "distilled_water_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@Column(name = "ph_reading_1", precision = 5, scale = 3)
	private BigDecimal phReading1;
	@Column(name = "ph_reading_2", precision = 5, scale = 3)
	private BigDecimal phReading2;
	@Column(name = "ph_reading_3", precision = 5, scale = 3)
	private BigDecimal phReading3;
	@Column(name = "ph_average", precision = 5, scale = 3)
	private BigDecimal phAverage;

	@Column(name = "ce_reading_1", precision = 8, scale = 4)
	private BigDecimal ceReading1;
	@Column(name = "ce_reading_2", precision = 8, scale = 4)
	private BigDecimal ceReading2;
	@Column(name = "ce_reading_3", precision = 8, scale = 4)
	private BigDecimal ceReading3;
	@Column(name = "ce_average", precision = 8, scale = 4)
	private BigDecimal ceAverage;

	@Column(name = "reference_difference", precision = 6, scale = 4)
	private BigDecimal referenceDifference;
	@Column(name = "control_standard_pct", precision = 6, scale = 2)
	private BigDecimal controlStandardPct;
	@Column(name = "is_acceptable")
	private Boolean isAcceptable;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "water_batch_id")
	private BatchEntity waterBatch;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sampler_user_id")
	private UserEntity samplerUser;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public BigDecimal getPhReading1() { return phReading1; }
	public void setPhReading1(BigDecimal v) { this.phReading1 = v; }
	public BigDecimal getPhReading2() { return phReading2; }
	public void setPhReading2(BigDecimal v) { this.phReading2 = v; }
	public BigDecimal getPhReading3() { return phReading3; }
	public void setPhReading3(BigDecimal v) { this.phReading3 = v; }
	public BigDecimal getPhAverage() { return phAverage; }
	public void setPhAverage(BigDecimal v) { this.phAverage = v; }
	public BigDecimal getCeReading1() { return ceReading1; }
	public void setCeReading1(BigDecimal v) { this.ceReading1 = v; }
	public BigDecimal getCeReading2() { return ceReading2; }
	public void setCeReading2(BigDecimal v) { this.ceReading2 = v; }
	public BigDecimal getCeReading3() { return ceReading3; }
	public void setCeReading3(BigDecimal v) { this.ceReading3 = v; }
	public BigDecimal getCeAverage() { return ceAverage; }
	public void setCeAverage(BigDecimal v) { this.ceAverage = v; }
	public BigDecimal getReferenceDifference() { return referenceDifference; }
	public void setReferenceDifference(BigDecimal v) { this.referenceDifference = v; }
	public BigDecimal getControlStandardPct() { return controlStandardPct; }
	public void setControlStandardPct(BigDecimal v) { this.controlStandardPct = v; }
	public Boolean getIsAcceptable() { return isAcceptable; }
	public void setIsAcceptable(Boolean v) { this.isAcceptable = v; }
	public BatchEntity getWaterBatch() { return waterBatch; }
	public void setWaterBatch(BatchEntity waterBatch) { this.waterBatch = waterBatch; }
	public UserEntity getSamplerUser() { return samplerUser; }
	public void setSamplerUser(UserEntity samplerUser) { this.samplerUser = samplerUser; }
}
