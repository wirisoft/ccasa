package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
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
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entrada de conductividad (RF-05: alta 0.7440â€“0.7490, baja 0.0744â€“0.0790).
 */
@Entity
@Table(name = "entry_conductivity")
public class EntryConductivityEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "conductivity_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@Enumerated(EnumType.STRING)
	@Column(name = "type", length = 20)
	private ConductivityTypeEnum type;

	@Column(name = "measured_value", precision = 8, scale = 4)
	private BigDecimal measuredValue;

	/** Peso (g) para cadena KCl 20-108; si está informado, la conductividad teórica va en calculated_value (µS/cm). */
	@Column(name = "weight_grams", precision = 12, scale = 6)
	private BigDecimal weightGrams;

	@Column(name = "calculated_mol", precision = 10, scale = 6)
	private BigDecimal calculatedMol;

	@Column(name = "calculated_value", precision = 10, scale = 6)
	private BigDecimal calculatedValue;

	@Column(name = "in_range")
	private Boolean inRange;

	@Column(name = "auto_date")
	private Instant autoDate;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public ConductivityTypeEnum getType() { return type; }
	public void setType(ConductivityTypeEnum type) { this.type = type; }
	public BigDecimal getMeasuredValue() { return measuredValue; }
	public void setMeasuredValue(BigDecimal measuredValue) { this.measuredValue = measuredValue; }
	public BigDecimal getWeightGrams() { return weightGrams; }
	public void setWeightGrams(BigDecimal weightGrams) { this.weightGrams = weightGrams; }
	public BigDecimal getCalculatedMol() { return calculatedMol; }
	public void setCalculatedMol(BigDecimal calculatedMol) { this.calculatedMol = calculatedMol; }
	public BigDecimal getCalculatedValue() { return calculatedValue; }
	public void setCalculatedValue(BigDecimal calculatedValue) { this.calculatedValue = calculatedValue; }
	public Boolean getInRange() { return inRange; }
	public void setInRange(Boolean inRange) { this.inRange = inRange; }
	public Instant getAutoDate() { return autoDate; }
	public void setAutoDate(Instant autoDate) { this.autoDate = autoDate; }
}

