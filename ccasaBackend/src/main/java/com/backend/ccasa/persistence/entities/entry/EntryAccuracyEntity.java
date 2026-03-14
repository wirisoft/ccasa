package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
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
@Table(name = "entry_accuracy")
public class EntryAccuracyEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "accuracy_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sampler_user_id")
	private UserEntity samplerUser;

	@Column(name = "batch_1_avg", precision = 8, scale = 4)
	private BigDecimal batch1Avg;
	@Column(name = "batch_2_avg", precision = 8, scale = 4)
	private BigDecimal batch2Avg;
	@Column(name = "difference", precision = 8, scale = 4)
	private BigDecimal difference;
	@Column(name = "in_range")
	private Boolean inRange;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ph_logbook_id")
	private LogbookEntity phLogbook;
	@Column(name = "ph_folio_number")
	private Integer phFolioNumber;
	@Column(name = "daily_record_date")
	private LocalDate dailyRecordDate;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public UserEntity getSamplerUser() { return samplerUser; }
	public void setSamplerUser(UserEntity samplerUser) { this.samplerUser = samplerUser; }
	public BigDecimal getBatch1Avg() { return batch1Avg; }
	public void setBatch1Avg(BigDecimal v) { this.batch1Avg = v; }
	public BigDecimal getBatch2Avg() { return batch2Avg; }
	public void setBatch2Avg(BigDecimal v) { this.batch2Avg = v; }
	public BigDecimal getDifference() { return difference; }
	public void setDifference(BigDecimal v) { this.difference = v; }
	public Boolean getInRange() { return inRange; }
	public void setInRange(Boolean v) { this.inRange = v; }
	public LogbookEntity getPhLogbook() { return phLogbook; }
	public void setPhLogbook(LogbookEntity phLogbook) { this.phLogbook = phLogbook; }
	public Integer getPhFolioNumber() { return phFolioNumber; }
	public void setPhFolioNumber(Integer phFolioNumber) { this.phFolioNumber = phFolioNumber; }
	public LocalDate getDailyRecordDate() { return dailyRecordDate; }
	public void setDailyRecordDate(LocalDate dailyRecordDate) { this.dailyRecordDate = dailyRecordDate; }
}
