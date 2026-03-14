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
import java.time.LocalDate;

/**
 * Lote (RF-04: batch_code = fecha + "mt").
 */
@Entity
@Table(name = "batch")
public class BatchEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "batch_id")
	private Long id;

	@Column(name = "batch_code", nullable = false, length = 50)
	private String batchCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reagent_id", nullable = false)
	private ReagentEntity reagent;

	@Column(name = "generated_at")
	private LocalDate generatedAt;

	@Column(name = "start_date")
	private LocalDate startDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getBatchCode() { return batchCode; }
	public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
	public ReagentEntity getReagent() { return reagent; }
	public void setReagent(ReagentEntity reagent) { this.reagent = reagent; }
	public LocalDate getGeneratedAt() { return generatedAt; }
	public void setGeneratedAt(LocalDate generatedAt) { this.generatedAt = generatedAt; }
	public LocalDate getStartDate() { return startDate; }
	public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
	public LocalDate getEndDate() { return endDate; }
	public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
