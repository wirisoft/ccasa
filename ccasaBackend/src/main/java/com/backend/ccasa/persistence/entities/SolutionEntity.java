package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "solution")
public class SolutionEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "solution_id")
	private Long id;

	@Column(name = "name", nullable = false, length = 120)
	private String name;

	@Column(name = "concentration", length = 50)
	private String concentration;

	@Column(name = "quantity", length = 50)
	private String quantity;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getConcentration() { return concentration; }
	public void setConcentration(String concentration) { this.concentration = concentration; }
	public String getQuantity() { return quantity; }
	public void setQuantity(String quantity) { this.quantity = quantity; }
}
