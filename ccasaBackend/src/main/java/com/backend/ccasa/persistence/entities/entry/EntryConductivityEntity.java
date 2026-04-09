package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
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
import java.time.LocalTime;

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

	@Column(name = "calculated_mol", precision = 14, scale = 8)
	private BigDecimal calculatedMol;

	@Column(name = "calculated_value", precision = 12, scale = 2)
	private BigDecimal calculatedValue;

	@Column(name = "in_range")
	private Boolean inRange;

	@Column(name = "auto_date")
	private Instant autoDate;

	@Column(name = "display_folio", length = 40)
	private String displayFolio;

	@Column(name = "preparation_time")
	private LocalTime preparationTime;

	@Column(name = "observation", columnDefinition = "TEXT")
	private String observation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reviewer_user_id")
	private UserEntity reviewerUser;

	@Column(name = "reviewed_at")
	private Instant reviewedAt;

	@Column(name = "reference_u_scm", precision = 12, scale = 4)
	private BigDecimal referenceUScm;

	@Column(name = "reference_mol", precision = 12, scale = 6)
	private BigDecimal referenceMol;

	@Column(name = "reference_standard_u_scm", precision = 10, scale = 2)
	private BigDecimal referenceStandardUScm;

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
	public String getDisplayFolio() { return displayFolio; }
	public void setDisplayFolio(String displayFolio) { this.displayFolio = displayFolio; }
	public LocalTime getPreparationTime() { return preparationTime; }
	public void setPreparationTime(LocalTime preparationTime) { this.preparationTime = preparationTime; }
	public String getObservation() { return observation; }
	public void setObservation(String observation) { this.observation = observation; }
	public UserEntity getReviewerUser() { return reviewerUser; }
	public void setReviewerUser(UserEntity reviewerUser) { this.reviewerUser = reviewerUser; }
	public Instant getReviewedAt() { return reviewedAt; }
	public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
	public BigDecimal getReferenceUScm() { return referenceUScm; }
	public void setReferenceUScm(BigDecimal referenceUScm) { this.referenceUScm = referenceUScm; }
	public BigDecimal getReferenceMol() { return referenceMol; }
	public void setReferenceMol(BigDecimal referenceMol) { this.referenceMol = referenceMol; }
	public BigDecimal getReferenceStandardUScm() { return referenceStandardUScm; }
	public void setReferenceStandardUScm(BigDecimal referenceStandardUScm) { this.referenceStandardUScm = referenceStandardUScm; }
}
