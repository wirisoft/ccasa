package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.service.IReferenceParameterService;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;

/**
 * Bitácora 20-108 conductividad alta: cadena Excel (hoja fecha) para estándar KCl.
 * C26=C25*B24/C24; F26=(peso*F24)/C26 con peso en g (E25=B10 en Excel → {@code weightGrams});
 * D29=F26; F30=(D29*F28)/D28. Resultado teórico en µS/cm (misma magnitud que F28).
 */
@Component
public class ConductivityHighKclComputation {

	private static final MathContext MC = new MathContext(14, RoundingMode.HALF_UP);

	public void apply(EntryConductivityEntity e, IReferenceParameterService refs) {
		if (e.getType() != ConductivityTypeEnum.High || e.getWeightGrams() == null) {
			return;
		}
		BigDecimal weight = e.getWeightGrams();
		if (weight.compareTo(BigDecimal.ZERO) <= 0) {
			return;
		}
		BigDecimal c25 = scalar(refs, ReferenceParameterCodes.KCL_HIGH_C25, ReferenceParameterDefaults.KCL_HIGH_C25);
		BigDecimal b24 = scalar(refs, ReferenceParameterCodes.KCL_HIGH_B24, ReferenceParameterDefaults.KCL_HIGH_B24);
		BigDecimal c24 = scalar(refs, ReferenceParameterCodes.KCL_HIGH_C24, ReferenceParameterDefaults.KCL_HIGH_C24);
		BigDecimal f24 = scalar(refs, ReferenceParameterCodes.KCL_HIGH_F24, ReferenceParameterDefaults.KCL_HIGH_F24);
		BigDecimal d28 = scalar(refs, ReferenceParameterCodes.KCL_HIGH_D28, ReferenceParameterDefaults.KCL_HIGH_D28);
		BigDecimal f28 = scalar(refs, ReferenceParameterCodes.KCL_HIGH_F28, ReferenceParameterDefaults.KCL_HIGH_F28);

		if (c24.compareTo(BigDecimal.ZERO) == 0 || d28.compareTo(BigDecimal.ZERO) == 0) {
			return;
		}
		// C26 = C25*B24/C24
		BigDecimal c26 = c25.multiply(b24, MC).divide(c24, MC);
		// F26 = (peso * F24) / C26  (Excel: (E25*F24)/E24, E25=peso, E24=C26)
		BigDecimal f26 = weight.multiply(f24, MC).divide(c26, MC);
		e.setCalculatedMol(f26);
		// F30 = (D29*F28)/D28, D29=F26
		BigDecimal f30 = f26.multiply(f28, MC).divide(d28, MC);
		e.setCalculatedValue(f30);
	}

	private static BigDecimal scalar(IReferenceParameterService refs, String code, BigDecimal defaultValue) {
		BigDecimal min = refs.getMinValue(code, defaultValue);
		BigDecimal max = refs.getMaxValue(code, defaultValue);
		if (min != null && max != null && min.compareTo(max) == 0) {
			return min;
		}
		return min != null ? min : max != null ? max : defaultValue;
	}
}
