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
@Table(name = "supply")
public class SupplyEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "supply_id")
	private Long id;

	@Column(name = "name", nullable = false, length = 100)
	private String name;

	@Column(name = "available_qty", precision = 10, scale = 2)
	private BigDecimal availableQty;

	@Column(name = "unit", length = 20)
	private String unit;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public BigDecimal getAvailableQty() { return availableQty; }
	public void setAvailableQty(BigDecimal availableQty) { this.availableQty = availableQty; }
	public String getUnit() { return unit; }
	public void setUnit(String unit) { this.unit = unit; }
}
