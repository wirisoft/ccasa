package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "entry_solution_prep")
public class EntrySolutionPrepEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@jakarta.persistence.Column(name = "solution_prep_entry_id")
	private Long solutionPrepEntryId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "solution_id", nullable = false)
	private SolutionEntity solution;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "weighing_entry_id")
	private EntryWeighingEntity weighingEntry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "analyst_user_id")
	private UserEntity analystUser;

	public Long getSolutionPrepEntryId() { return solutionPrepEntryId; }
	public void setSolutionPrepEntryId(Long id) { this.solutionPrepEntryId = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public SolutionEntity getSolution() { return solution; }
	public void setSolution(SolutionEntity solution) { this.solution = solution; }
	public EntryWeighingEntity getWeighingEntry() { return weighingEntry; }
	public void setWeighingEntry(EntryWeighingEntity weighingEntry) { this.weighingEntry = weighingEntry; }
	public UserEntity getAnalystUser() { return analystUser; }
	public void setAnalystUser(UserEntity analystUser) { this.analystUser = analystUser; }
}
