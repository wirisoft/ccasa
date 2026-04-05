package com.backend.ccasa.service.impl.support;

/**
 * Códigos de {@code lab_reference_parameter} alineados con RF y documentación Excel.
 */
public final class ReferenceParameterCodes {

	public static final String RF05_CONDUCTIVITY_HIGH = "RF05_CONDUCTIVITY_HIGH";
	public static final String RF05_CONDUCTIVITY_LOW = "RF05_CONDUCTIVITY_LOW";
	public static final String RF06_OVEN_CORRECTED_TEMP = "RF06_OVEN_CORRECTED_TEMP";
	public static final String ACCURACY_MAX_ABS_DIFFERENCE = "ACCURACY_MAX_ABS_DIFFERENCE";

	/** Definiciones documentales (min/max null); semántica de fórmulas en aplicación. */
	public static final String FORMULA_RF08_PH_AVG = "FORMULA_RF08_PH_AVG";
	public static final String FORMULA_RF08_CE_AVG = "FORMULA_RF08_CE_AVG";
	public static final String FORMULA_RF08_ACCEPTABLE = "FORMULA_RF08_ACCEPTABLE";
	public static final String FORMULA_RF05_CONDUCTIVITY_IN_RANGE = "FORMULA_RF05_CONDUCTIVITY_IN_RANGE";
	public static final String FORMULA_RF06_OVEN_CORRECTED = "FORMULA_RF06_OVEN_CORRECTED";
	public static final String FORMULA_ACCURACY_DIFF = "FORMULA_ACCURACY_DIFF";
	public static final String FORMULA_EXPENSE_KCL_JAR = "FORMULA_EXPENSE_KCL_JAR";
	public static final String FORMULA_SOLUTION_PREP_WEIGHING = "FORMULA_SOLUTION_PREP_WEIGHING";

	/** Cadena de preparación estándar KCl conductividad alta (bitácora 20-108, hojas YYYYMMDD). Ver FORMULA_RF05_KCL_HIGH_PREP_CHAIN. */
	public static final String FORMULA_RF05_KCL_HIGH_PREP_CHAIN = "FORMULA_RF05_KCL_HIGH_PREP_CHAIN";

	/** Constantes de celda Excel 20-108 (hoja fecha); min=max cuando es un único escalar. */
	public static final String KCL_HIGH_C25 = "KCL_HIGH_C25";
	public static final String KCL_HIGH_B24 = "KCL_HIGH_B24";
	public static final String KCL_HIGH_C24 = "KCL_HIGH_C24";
	public static final String KCL_HIGH_F24 = "KCL_HIGH_F24";
	public static final String KCL_HIGH_D28 = "KCL_HIGH_D28";
	public static final String KCL_HIGH_F28 = "KCL_HIGH_F28";

	/** Rango aceptable conductividad teórica (µS/cm) tras la cadena KCl; no es RF05 mS/cm de lectura directa. */
	public static final String KCL_HIGH_THEORETICAL_U_CM = "KCL_HIGH_THEORETICAL_U_CM";

	/** Conductividad baja 20-108-01: misma cadena celular que alta (excel_formulas.json). */
	public static final String FORMULA_RF05_KCL_LOW_PREP_CHAIN = "FORMULA_RF05_KCL_LOW_PREP_CHAIN";

	/** Hoja BD en algunos libros CB (ej. 20-111-01 BCN): día de la semana y ajuste MCF. */
	public static final String FORMULA_RF05_CB_BD_MCF_ADJUST = "FORMULA_RF05_CB_BD_MCF_ADJUST";

	/** Carta gastos CE: aleatorio en rango INF-SUP (Excel). */
	public static final String FORMULA_GASTOS_CE_BD_RANDOM = "FORMULA_GASTOS_CE_BD_RANDOM";

	/** Carta gastos CE: recorte texto VALOR. */
	public static final String FORMULA_GASTOS_CE_VALOR_LEFT6 = "FORMULA_GASTOS_CE_VALOR_LEFT6";

	/** Carta gastos pH: acumulado restando columna B (hojas DISOLUCION). */
	public static final String FORMULA_GASTOS_PH_DISOLUCION_ACCUM = "FORMULA_GASTOS_PH_DISOLUCION_ACCUM";

	/** Carta control horno secado: enlaces mes/plantilla en algunas hojas. */
	public static final String FORMULA_CARTA_HORNO_MES_ENLACE = "FORMULA_CARTA_HORNO_MES_ENLACE";

	/** M-HS-01: secuencia folio en hoja FOLIO 15-200. */
	public static final String FORMULA_MHS_FOLIO15_SECUENCIA = "FORMULA_MHS_FOLIO15_SECUENCIA";

	/** M-LM-01: incrementos +7 días en columna A (folios). */
	public static final String FORMULA_MLM_SEMANA_MAS7 = "FORMULA_MLM_SEMANA_MAS7";

	/** M-SOL-01: MACHOTE numeración de folios. */
	public static final String FORMULA_MSOL_MACHOTE_FOLIO = "FORMULA_MSOL_MACHOTE_FOLIO";

	/** M-SOL-01: hojas fecha, propagación de bloques. */
	public static final String FORMULA_MSOL_FECHA_BLOQUE = "FORMULA_MSOL_FECHA_BLOQUE";

	/** M-SOL-02: hoja BD, textos con INDEX/MATCH sobre tablas. */
	public static final String FORMULA_MSOL_02_BD_INDEX = "FORMULA_MSOL_02_BD_INDEX";

	/** Constantes cadena KCl conductividad baja (misma forma que alta; ver conductivity_low_20_108_constants.json). */
	public static final String KCL_LOW_C25 = "KCL_LOW_C25";
	public static final String KCL_LOW_B24 = "KCL_LOW_B24";
	public static final String KCL_LOW_C24 = "KCL_LOW_C24";
	public static final String KCL_LOW_F24 = "KCL_LOW_F24";
	public static final String KCL_LOW_D28 = "KCL_LOW_D28";
	public static final String KCL_LOW_F28 = "KCL_LOW_F28";

	public static final String KCL_LOW_THEORETICAL_U_CM = "KCL_LOW_THEORETICAL_U_CM";

	private ReferenceParameterCodes() {
	}
}
