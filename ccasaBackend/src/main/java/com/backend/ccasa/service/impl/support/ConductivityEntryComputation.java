package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.service.IReferenceParameterService;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * RF-05: lectura directa en mS/cm frente a min/max RF05.
 * Conductividad teórica KCl: con {@code weightGrams}, se contrasta {@code calculatedValue} (µS/cm) con
 * {@link ReferenceParameterCodes#KCL_HIGH_THEORETICAL_U_CM} (alta) o {@link ReferenceParameterCodes#KCL_LOW_THEORETICAL_U_CM} (baja).
 */
@Component
public class ConductivityEntryComputation {

	public void apply(EntryConductivityEntity e, IReferenceParameterService refs) {
		if (e.getType() == ConductivityTypeEnum.High && e.getWeightGrams() != null) {
			BigDecimal v = e.getCalculatedValue();
			if (v == null) {
				e.setInRange(null);
				return;
			}
			BigDecimal min = refs.getMinValue(
				ReferenceParameterCodes.KCL_HIGH_THEORETICAL_U_CM,
				ReferenceParameterDefaults.KCL_HIGH_THEORY_MIN_U_CM
			);
			BigDecimal max = refs.getMaxValue(
				ReferenceParameterCodes.KCL_HIGH_THEORETICAL_U_CM,
				ReferenceParameterDefaults.KCL_HIGH_THEORY_MAX_U_CM
			);
			e.setInRange(v.compareTo(min) >= 0 && v.compareTo(max) <= 0);
			return;
		}
		if (e.getType() == ConductivityTypeEnum.Low && e.getWeightGrams() != null) {
			BigDecimal v = e.getCalculatedValue();
			if (v == null) {
				e.setInRange(null);
				return;
			}
			BigDecimal min = refs.getMinValue(
				ReferenceParameterCodes.KCL_LOW_THEORETICAL_U_CM,
				ReferenceParameterDefaults.KCL_LOW_THEORY_MIN_U_CM
			);
			BigDecimal max = refs.getMaxValue(
				ReferenceParameterCodes.KCL_LOW_THEORETICAL_U_CM,
				ReferenceParameterDefaults.KCL_LOW_THEORY_MAX_U_CM
			);
			e.setInRange(v.compareTo(min) >= 0 && v.compareTo(max) <= 0);
			return;
		}
		if (e.getMeasuredValue() != null && e.getCalculatedValue() == null) {
			e.setCalculatedValue(e.getMeasuredValue());
		}
		BigDecimal v = e.getCalculatedValue() != null ? e.getCalculatedValue() : e.getMeasuredValue();
		if (v == null || e.getType() == null) {
			e.setInRange(null);
			return;
		}
		BigDecimal min;
		BigDecimal max;
		if (e.getType() == ConductivityTypeEnum.High) {
			min = refs.getMinValue(ReferenceParameterCodes.RF05_CONDUCTIVITY_HIGH, ReferenceParameterDefaults.RF05_HIGH_MIN);
			max = refs.getMaxValue(ReferenceParameterCodes.RF05_CONDUCTIVITY_HIGH, ReferenceParameterDefaults.RF05_HIGH_MAX);
		} else {
			min = refs.getMinValue(ReferenceParameterCodes.RF05_CONDUCTIVITY_LOW, ReferenceParameterDefaults.RF05_LOW_MIN);
			max = refs.getMaxValue(ReferenceParameterCodes.RF05_CONDUCTIVITY_LOW, ReferenceParameterDefaults.RF05_LOW_MAX);
		}
		e.setInRange(v.compareTo(min) >= 0 && v.compareTo(max) <= 0);
	}
}
