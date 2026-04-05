package com.backend.ccasa.service.impl.support;

import java.math.BigDecimal;

/**
 * Valores por defecto cuando aún no existen filas en {@code lab_reference_parameter}.
 */
public final class ReferenceParameterDefaults {

	public static final BigDecimal RF05_HIGH_MIN = new BigDecimal("0.7440");
	public static final BigDecimal RF05_HIGH_MAX = new BigDecimal("0.7490");
	public static final BigDecimal RF05_LOW_MIN = new BigDecimal("0.0744");
	public static final BigDecimal RF05_LOW_MAX = new BigDecimal("0.0790");
	/** Temperatura corregida (RF-06): rango aceptable en °C. */
	public static final BigDecimal RF06_OVEN_MIN = new BigDecimal("103");
	public static final BigDecimal RF06_OVEN_MAX = new BigDecimal("107");
	/** Tolerancia máxima para |promedio lote1 − promedio lote2| en referencia cruzada. */
	public static final BigDecimal ACCURACY_MAX_ABS_DIFF = new BigDecimal("0.15");

	/**
	 * Constantes alineadas a hoja 20-108 --CONDUCTIVIDAD ALTA (Excel; ver excel_formulas.json y
	 * {@code conductivity_high_20_108_constants.json}). Regenerar con {@code extract_conductivity_high_20_108_constants.py} si cambia el libro.
	 */
	public static final BigDecimal KCL_HIGH_C25 = new BigDecimal("7.4565");
	public static final BigDecimal KCL_HIGH_B24 = new BigDecimal("0.01");
	public static final BigDecimal KCL_HIGH_C24 = new BigDecimal("0.1");
	public static final BigDecimal KCL_HIGH_F24 = new BigDecimal("0.01");
	public static final BigDecimal KCL_HIGH_D28 = new BigDecimal("0.01");
	public static final BigDecimal KCL_HIGH_F28 = new BigDecimal("1412");
	/** Límite inferior conductividad teórica (µS/cm) para aceptación cuando se usa peso (cadena KCl). */
	public static final BigDecimal KCL_HIGH_THEORY_MIN_U_CM = new BigDecimal("1400");
	/** Límite superior conductividad teórica (µS/cm). */
	public static final BigDecimal KCL_HIGH_THEORY_MAX_U_CM = new BigDecimal("1420");

	/**
	 * Cadena KCl conductividad baja (20-108-01): misma topología que alta; valores por defecto iguales hasta
	 * regenerar con {@code extract_conductivity_low_20_108_constants.py} y {@code conductivity_low_20_108_constants.json}.
	 */
	public static final BigDecimal KCL_LOW_C25 = new BigDecimal("7.4565");
	public static final BigDecimal KCL_LOW_B24 = new BigDecimal("0.01");
	public static final BigDecimal KCL_LOW_C24 = new BigDecimal("0.1");
	public static final BigDecimal KCL_LOW_F24 = new BigDecimal("0.01");
	public static final BigDecimal KCL_LOW_D28 = new BigDecimal("0.01");
	public static final BigDecimal KCL_LOW_F28 = new BigDecimal("1412");
	public static final BigDecimal KCL_LOW_THEORY_MIN_U_CM = new BigDecimal("1400");
	public static final BigDecimal KCL_LOW_THEORY_MAX_U_CM = new BigDecimal("1420");

	private ReferenceParameterDefaults() {
	}
}
