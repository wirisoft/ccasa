package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.ReagentEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
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

@Entity
@Table(name = "entry_weighing")
public class EntryWeighingEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "weighing_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reagent_id")
	private ReagentEntity reagent;

	@Column(name = "weight_grams", precision = 10, scale = 4)
	private BigDecimal weightGrams;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "target_solution_id")
	private SolutionEntity targetSolution;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public ReagentEntity getReagent() { return reagent; }
	public void setReagent(ReagentEntity reagent) { this.reagent = reagent; }
	public BigDecimal getWeightGrams() { return weightGrams; }
	public void setWeightGrams(BigDecimal weightGrams) { this.weightGrams = weightGrams; }
	public SolutionEntity getTargetSolution() { return targetSolution; }
	public void setTargetSolution(SolutionEntity targetSolution) { this.targetSolution = targetSolution; }
}
