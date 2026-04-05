package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity;
import com.backend.ccasa.service.IReferenceParameterService;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * Diferencia absoluta entre promedios de lote; dentro de tolerancia configurable.
 */
@Component
public class AccuracyEntryComputation {

	public void apply(EntryAccuracyEntity e, IReferenceParameterService refs) {
		if (e.getBatch1Avg() != null && e.getBatch2Avg() != null) {
			BigDecimal diff = e.getBatch1Avg().subtract(e.getBatch2Avg()).abs();
			e.setDifference(diff);
			BigDecimal maxTol = refs.getMaxValue(ReferenceParameterCodes.ACCURACY_MAX_ABS_DIFFERENCE, ReferenceParameterDefaults.ACCURACY_MAX_ABS_DIFF);
			e.setInRange(diff.compareTo(maxTol) <= 0);
		} else {
			e.setDifference(null);
			e.setInRange(null);
		}
	}
}
