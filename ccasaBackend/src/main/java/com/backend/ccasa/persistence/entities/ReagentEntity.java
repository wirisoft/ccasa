package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "reagent")
public class ReagentEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "reagent_id")
	private Long id;

	@Column(name = "name", nullable = false, length = 120)
	private String name;

	@Column(name = "chemical_formula", length = 50)
	private String chemicalFormula;

	@Column(name = "unit", length = 20)
	private String unit;

	@Column(name = "total_stock", precision = 10, scale = 4)
	private BigDecimal totalStock;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getChemicalFormula() { return chemicalFormula; }
	public void setChemicalFormula(String chemicalFormula) { this.chemicalFormula = chemicalFormula; }
	public String getUnit() { return unit; }
	public void setUnit(String unit) { this.unit = unit; }
	public BigDecimal getTotalStock() { return totalStock; }
	public void setTotalStock(BigDecimal totalStock) { this.totalStock = totalStock; }
}
