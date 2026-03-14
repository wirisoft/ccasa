package com.backend.ccasa.persistence.entities.entry;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.services.models.enums.PieceTypeEnum;
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
import java.time.LocalDate;

/**
 * Lavado de material (RF-09: Carboy/Flask, máx 12 entradas por folio).
 */
@Entity
@Table(name = "entry_material_wash")
public class EntryMaterialWashEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "material_wash_entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "entry_id", nullable = false)
	private EntryEntity entry;

	@Column(name = "monday_date")
	private LocalDate mondayDate;

	@Enumerated(EnumType.STRING)
	@Column(name = "piece_type", length = 20)
	private PieceTypeEnum pieceType;

	@Column(name = "material", length = 100)
	private String material;
	@Column(name = "determination", length = 100)
	private String determination;
	@Column(name = "color", length = 50)
	private String color;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "analyst_user_id")
	private UserEntity analystUser;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "supervisor_user_id")
	private UserEntity supervisorUser;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public EntryEntity getEntry() { return entry; }
	public void setEntry(EntryEntity entry) { this.entry = entry; }
	public LocalDate getMondayDate() { return mondayDate; }
	public void setMondayDate(LocalDate mondayDate) { this.mondayDate = mondayDate; }
	public PieceTypeEnum getPieceType() { return pieceType; }
	public void setPieceType(PieceTypeEnum pieceType) { this.pieceType = pieceType; }
	public String getMaterial() { return material; }
	public void setMaterial(String material) { this.material = material; }
	public String getDetermination() { return determination; }
	public void setDetermination(String determination) { this.determination = determination; }
	public String getColor() { return color; }
	public void setColor(String color) { this.color = color; }
	public UserEntity getAnalystUser() { return analystUser; }
	public void setAnalystUser(UserEntity analystUser) { this.analystUser = analystUser; }
	public UserEntity getSupervisorUser() { return supervisorUser; }
	public void setSupervisorUser(UserEntity supervisorUser) { this.supervisorUser = supervisorUser; }
}
