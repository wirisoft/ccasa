package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.SupplyEntity;
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
import java.time.LocalDate;

@Entity
@Table(name = "entry_flask_treatment")
public class EntryFlaskTreatmentEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "flask_treatment_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "wash_entry_id")
	private EntryMaterialWashEntity washEntry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "swab_supply_id")
	private SupplyEntity swabSupply;

	@Column(name = "swabs_used")
	private Integer swabsUsed;
	@Column(name = "analysis_value", precision = 8, scale = 4)
	private BigDecimal analysisValue;
	@Column(name = "cmc_result", length = 20)
	private String cmcResult;
	@Column(name = "report_date")
	private LocalDate reportDate;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "supervisor_user_id")
	private UserEntity supervisorUser;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public EntryMaterialWashEntity getWashEntry() { return washEntry; }
	public void setWashEntry(EntryMaterialWashEntity washEntry) { this.washEntry = washEntry; }
	public SupplyEntity getSwabSupply() { return swabSupply; }
	public void setSwabSupply(SupplyEntity swabSupply) { this.swabSupply = swabSupply; }
	public Integer getSwabsUsed() { return swabsUsed; }
	public void setSwabsUsed(Integer swabsUsed) { this.swabsUsed = swabsUsed; }
	public BigDecimal getAnalysisValue() { return analysisValue; }
	public void setAnalysisValue(BigDecimal analysisValue) { this.analysisValue = analysisValue; }
	public String getCmcResult() { return cmcResult; }
	public void setCmcResult(String cmcResult) { this.cmcResult = cmcResult; }
	public LocalDate getReportDate() { return reportDate; }
	public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }
	public UserEntity getSupervisorUser() { return supervisorUser; }
	public void setSupervisorUser(UserEntity supervisorUser) { this.supervisorUser = supervisorUser; }
}
