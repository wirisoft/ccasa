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
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "reagent_jar")
public class ReagentJarEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "reagent_jar_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reagent_id", nullable = false)
	private ReagentEntity reagent;

	@Column(name = "initial_amount_g", precision = 10, scale = 4)
	private BigDecimal initialAmountG;

	@Column(name = "current_amount_g", precision = 10, scale = 4)
	private BigDecimal currentAmountG;

	@Column(name = "opened_at")
	private LocalDate openedAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public ReagentEntity getReagent() { return reagent; }
	public void setReagent(ReagentEntity reagent) { this.reagent = reagent; }
	public BigDecimal getInitialAmountG() { return initialAmountG; }
	public void setInitialAmountG(BigDecimal initialAmountG) { this.initialAmountG = initialAmountG; }
	public BigDecimal getCurrentAmountG() { return currentAmountG; }
	public void setCurrentAmountG(BigDecimal currentAmountG) { this.currentAmountG = currentAmountG; }
	public LocalDate getOpenedAt() { return openedAt; }
	public void setOpenedAt(LocalDate openedAt) { this.openedAt = openedAt; }
}
