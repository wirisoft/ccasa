package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.ReagentJarEntity;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.models.enums.WaterTypeEnum;
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
import java.time.LocalDate;

/**
 * Carta de gastos (RF-04: descontar KCl en REAGENT_JAR, batch_code fecha+mt).
 */
@Entity
@Table(name = "entry_expense_chart")
public class EntryExpenseChartEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "expense_chart_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@Column(name = "employment_date")
	private LocalDate employmentDate;
	@Column(name = "end_date")
	private LocalDate endDate;
	@Column(name = "equipment_key", length = 50)
	private String equipmentKey;
	@Column(name = "distilled_water_qty", precision = 8, scale = 2)
	private BigDecimal distilledWaterQty;
	@Enumerated(EnumType.STRING)
	@Column(name = "water_type", length = 30)
	private WaterTypeEnum waterType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "batch_id")
	private BatchEntity batch;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "kcl_jar_id")
	private ReagentJarEntity kclJar;
	@Column(name = "kcl_used_g", precision = 10, scale = 4)
	private BigDecimal kclUsedG;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public LocalDate getEmploymentDate() { return employmentDate; }
	public void setEmploymentDate(LocalDate employmentDate) { this.employmentDate = employmentDate; }
	public LocalDate getEndDate() { return endDate; }
	public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
	public String getEquipmentKey() { return equipmentKey; }
	public void setEquipmentKey(String equipmentKey) { this.equipmentKey = equipmentKey; }
	public BigDecimal getDistilledWaterQty() { return distilledWaterQty; }
	public void setDistilledWaterQty(BigDecimal distilledWaterQty) { this.distilledWaterQty = distilledWaterQty; }
	public WaterTypeEnum getWaterType() { return waterType; }
	public void setWaterType(WaterTypeEnum waterType) { this.waterType = waterType; }
	public BatchEntity getBatch() { return batch; }
	public void setBatch(BatchEntity batch) { this.batch = batch; }
	public ReagentJarEntity getKclJar() { return kclJar; }
	public void setKclJar(ReagentJarEntity kclJar) { this.kclJar = kclJar; }
	public BigDecimal getKclUsedG() { return kclUsedG; }
	public void setKclUsedG(BigDecimal kclUsedG) { this.kclUsedG = kclUsedG; }
}

