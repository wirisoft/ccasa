package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity;
import com.backend.ccasa.service.IReferenceParameterService;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * RF-06: temperatura corregida = lectura bruta − 1 °C; rango aceptable en parámetros RF06.
 */
@Component
public class OvenTempEntryComputation {

	public void apply(EntryOvenTempEntity e, IReferenceParameterService refs) {
		if (e.getRawTemperature() != null) {
			e.setCorrectedTemperature(e.getRawTemperature().subtract(BigDecimal.ONE));
		}
		BigDecimal corrected = e.getCorrectedTemperature();
		if (corrected == null) {
			e.setInRange(null);
			return;
		}
		BigDecimal min = refs.getMinValue(ReferenceParameterCodes.RF06_OVEN_CORRECTED_TEMP, ReferenceParameterDefaults.RF06_OVEN_MIN);
		BigDecimal max = refs.getMaxValue(ReferenceParameterCodes.RF06_OVEN_CORRECTED_TEMP, ReferenceParameterDefaults.RF06_OVEN_MAX);
		e.setInRange(corrected.compareTo(min) >= 0 && corrected.compareTo(max) <= 0);
	}
}
