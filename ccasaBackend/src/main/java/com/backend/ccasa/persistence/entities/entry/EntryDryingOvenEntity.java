package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.ReagentEntity;
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
import java.time.LocalTime;

@Entity
@Table(name = "entry_drying_oven")
public class EntryDryingOvenEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "drying_oven_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reagent_id")
	private ReagentEntity reagent;

	@Column(name = "entry_time")
	private LocalTime entryTime;
	@Column(name = "exit_time")
	private LocalTime exitTime;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "analyst_user_id")
	private UserEntity analystUser;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "supervisor_user_id")
	private UserEntity supervisorUser;

	@Column(name = "meets_temp")
	private Boolean meetsTemp;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public ReagentEntity getReagent() { return reagent; }
	public void setReagent(ReagentEntity reagent) { this.reagent = reagent; }
	public LocalTime getEntryTime() { return entryTime; }
	public void setEntryTime(LocalTime entryTime) { this.entryTime = entryTime; }
	public LocalTime getExitTime() { return exitTime; }
	public void setExitTime(LocalTime exitTime) { this.exitTime = exitTime; }
	public UserEntity getAnalystUser() { return analystUser; }
	public void setAnalystUser(UserEntity analystUser) { this.analystUser = analystUser; }
	public UserEntity getSupervisorUser() { return supervisorUser; }
	public void setSupervisorUser(UserEntity supervisorUser) { this.supervisorUser = supervisorUser; }
	public Boolean getMeetsTemp() { return meetsTemp; }
	public void setMeetsTemp(Boolean meetsTemp) { this.meetsTemp = meetsTemp; }
}
