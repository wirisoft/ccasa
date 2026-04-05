package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Parámetros de referencia del laboratorio (límites RF-05, RF-06, tolerancias, etc.).
 */
@Entity
@Table(name = "lab_reference_parameter")
public class ReferenceParameterEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "reference_parameter_id")
	private Long id;

	@Column(name = "code", nullable = false, length = 80, unique = true)
	private String code;

	@Column(name = "min_value", precision = 20, scale = 10)
	private BigDecimal minValue;

	@Column(name = "max_value", precision = 20, scale = 10)
	private BigDecimal maxValue;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	/** Texto extendido: qué calcula o valida la regla en el dominio (semántica de fórmula). */
	@Column(name = "rule_detail", columnDefinition = "TEXT")
	private String ruleDetail;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public BigDecimal getMinValue() {
		return minValue;
	}

	public void setMinValue(BigDecimal minValue) {
		this.minValue = minValue;
	}

	public BigDecimal getMaxValue() {
		return maxValue;
	}

	public void setMaxValue(BigDecimal maxValue) {
		this.maxValue = maxValue;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getRuleDetail() {
		return ruleDetail;
	}

	public void setRuleDetail(String ruleDetail) {
		this.ruleDetail = ruleDetail;
	}
}
