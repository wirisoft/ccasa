package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Equipo de laboratorio (activos del listado: potenciómetro, horno, balanza, etc.).
 */
@Entity
@Table(name = "lab_equipment")
public class LaboratoryEquipmentEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "lab_equipment_id")
	private Long id;

	@Column(name = "equipment_type", nullable = false, length = 80)
	private String equipmentType;

	@Column(name = "denomination", nullable = false, length = 80, unique = true)
	private String denomination;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getEquipmentType() {
		return equipmentType;
	}

	public void setEquipmentType(String equipmentType) {
		this.equipmentType = equipmentType;
	}

	public String getDenomination() {
		return denomination;
	}

	public void setDenomination(String denomination) {
		this.denomination = denomination;
	}
}
