package com.backend.ccasa.config;

import com.backend.ccasa.persistence.entities.LaboratoryEquipmentEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.ReferenceParameterEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.persistence.repositories.LaboratoryEquipmentRepository;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.persistence.repositories.ReferenceParameterRepository;
import com.backend.ccasa.persistence.repositories.SolutionRepository;
import com.backend.ccasa.service.impl.support.ReferenceParameterCodes;
import com.backend.ccasa.service.impl.support.ReferenceParameterDefaults;
import java.math.BigDecimal;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inicialización de datos por defecto del laboratorio (patrón análogo a CompanyInitializationService en Gama).
 * Idempotente: bitácoras por código 1–15; parámetros por {@code code}; soluciones por nombre+concentración; equipos por denominación.
 */
@Service
public class LaboratoryInitializationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(LaboratoryInitializationService.class);

	private static final int LOGBOOK_CODE_MIN = 1;
	private static final int LOGBOOK_CODE_MAX = 15;

	private final LogbookRepository logbookRepository;
	private final ReferenceParameterRepository referenceParameterRepository;
	private final SolutionRepository solutionRepository;
	private final LaboratoryEquipmentRepository laboratoryEquipmentRepository;

	public LaboratoryInitializationService(
		LogbookRepository logbookRepository,
		ReferenceParameterRepository referenceParameterRepository,
		SolutionRepository solutionRepository,
		LaboratoryEquipmentRepository laboratoryEquipmentRepository
	) {
		this.logbookRepository = logbookRepository;
		this.referenceParameterRepository = referenceParameterRepository;
		this.solutionRepository = solutionRepository;
		this.laboratoryEquipmentRepository = laboratoryEquipmentRepository;
	}

	/**
	 * Carga inicial en despliegue single-tenant: 15 bitácoras (UI-01), parámetros RF, textos de reglas,
	 * catálogo de soluciones y equipos.
	 */
	@Transactional
	public void ensureDefaultLaboratoryData() {
		logAndSeedDefaultCatalog();
	}

	/**
	 * Punto de enganche cuando exista entidad de laboratorio/empresa y datos por tenant.
	 * Hoy el esquema es single-tenant (sin FK {@code laboratory_id} en parámetros); se aplica el mismo seed global.
	 * Tras añadir multi-tenant, invocar este método tras persistir el laboratorio (como CompanyServiceImpl en Gama).
	 *
	 * @param laboratoryId identificador del laboratorio; puede ser null (mismo comportamiento que {@link #ensureDefaultLaboratoryData()})
	 */
	@Transactional
	public void initializeLaboratoryData(Long laboratoryId) {
		if (laboratoryId != null) {
			LOGGER.info(
				"initializeLaboratoryData(laboratoryId={}): multi-tenant por laboratorio aún no modelado en BD; aplicando seed global",
				laboratoryId
			);
		}
		logAndSeedDefaultCatalog();
	}

	private void logAndSeedDefaultCatalog() {
		LOGGER.info("Inicializando datos por defecto del laboratorio (single-tenant)");
		seedDefaultCatalogData();
		LOGGER.info("Inicialización de datos por defecto del laboratorio completada");
	}

	private void seedDefaultCatalogData() {
		ensureLogbooksForCodesInRange();
		upsertReferenceParametersAndFormulaDefinitions();
		initializeSolutionsFromList();
		initializeEquipmentFromList();
	}

	/**
	 * Idempotencia por código único en BD: si ya hay fila con ese {@code code} (activa o borrada lógicamente),
	 * no se inserta otra; si solo existe borrada, se reactiva y actualiza metadatos.
	 */
	private void ensureLogbooksForCodesInRange() {
		LOGGER.info("Asegurando bitácoras códigos {}..{} (idempotente por código)", LOGBOOK_CODE_MIN, LOGBOOK_CODE_MAX);
		int created = 0;
		for (int code = LOGBOOK_CODE_MIN; code <= LOGBOOK_CODE_MAX; code++) {
			Optional<LogbookEntity> existing = logbookRepository.findByCode(code);
			if (existing.isPresent()) {
				LogbookEntity l = existing.get();
				if (l.getDeletedAt() != null) {
					clearSoftDeleteIfPresent(l);
					l.setName("Bitácora " + code);
					l.setDescription("Bitácora de laboratorio código " + code);
					l.setMaxEntries(200);
					logbookRepository.save(l);
					created++;
				}
				continue;
			}
			LogbookEntity l = new LogbookEntity();
			l.setCode(code);
			l.setName("Bitácora " + code);
			l.setDescription("Bitácora de laboratorio código " + code);
			l.setMaxEntries(200);
			logbookRepository.save(l);
			created++;
		}
		LOGGER.info("Bitácoras: {} creadas o reactivadas; resto ya activas", created);
	}

	/**
	 * Límites numéricos RF y filas solo documentales (FORMULA_*) con min/max null.
	 */
	private void upsertReferenceParametersAndFormulaDefinitions() {
		LOGGER.info("Asegurando parámetros de referencia y definiciones de fórmulas (idempotente)");
		ensureRef(
			ReferenceParameterCodes.RF05_CONDUCTIVITY_HIGH,
			ReferenceParameterDefaults.RF05_HIGH_MIN,
			ReferenceParameterDefaults.RF05_HIGH_MAX,
			"RF-05 conductividad alta (rango de referencia)",
			"RF-05: el valor evaluado (calculado o, si no existe, medido) debe estar entre min y max para tipo Alta. "
				+ "Ver FORMULA_RF05_CONDUCTIVITY_IN_RANGE."
		);
		ensureRef(
			ReferenceParameterCodes.RF05_CONDUCTIVITY_LOW,
			ReferenceParameterDefaults.RF05_LOW_MIN,
			ReferenceParameterDefaults.RF05_LOW_MAX,
			"RF-05 conductividad baja (rango de referencia)",
			"RF-05: el valor evaluado (calculado o, si no existe, medido) debe estar entre min y max para tipo Baja. "
				+ "Ver FORMULA_RF05_CONDUCTIVITY_IN_RANGE."
		);
		ensureRef(
			ReferenceParameterCodes.RF06_OVEN_CORRECTED_TEMP,
			ReferenceParameterDefaults.RF06_OVEN_MIN,
			ReferenceParameterDefaults.RF06_OVEN_MAX,
			"RF-06 temperatura corregida horno (grados C, rango aceptable)",
			"RF-06: temperatura corregida = lectura bruta − 1 °C. El rango aceptable de la corregida está dado por min/max. "
				+ "Ver FORMULA_RF06_OVEN_CORRECTED."
		);
		ensureRef(
			ReferenceParameterCodes.ACCURACY_MAX_ABS_DIFFERENCE,
			null,
			ReferenceParameterDefaults.ACCURACY_MAX_ABS_DIFF,
			"Tolerancia máxima |promedio lote1 − promedio lote2| (referencia cruzada)",
			"Se compara la diferencia absoluta entre promedios de dos lotes con el máximo permitido (max_value). "
				+ "Ver FORMULA_ACCURACY_DIFF."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF08_PH_AVG,
			"RF-08 agua destilada: promedio pH",
			"Promedio pH = (lectura1 + lectura2 + lectura3) / 3, redondeo HALF_UP a 3 decimales."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF08_CE_AVG,
			"RF-08 agua destilada: promedio conductividad eléctrica (CE)",
			"Promedio CE = (lectura1 + lectura2 + lectura3) / 3, redondeo HALF_UP a 4 decimales."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF08_ACCEPTABLE,
			"RF-08 agua destilada: criterio aceptable",
			"Si referenceDifference ≥ 0 y controlStandardPct ≤ 100, la muestra se considera aceptable (is_acceptable)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_CONDUCTIVITY_IN_RANGE,
			"RF-05 conductividad: en rango",
			"Se toma valor = calculatedValue si existe; si no, measuredValue. in_range = (min ≤ valor ≤ max) según tipo Alto/Bajo."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF06_OVEN_CORRECTED,
			"RF-06 horno: temperatura corregida y en rango",
			"correctedTemperature = rawTemperature − 1. in_range = (min ≤ corrected ≤ max) usando parámetros RF06."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_ACCURACY_DIFF,
			"Precisión / referencia cruzada: diferencia entre lotes",
			"difference = |batch1Avg − batch2Avg|. in_range = (difference ≤ tolerancia en ACCURACY_MAX_ABS_DIFFERENCE.max_value)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_EXPENSE_KCL_JAR,
			"Carta de gastos: consumo de KCl desde frasco",
			"Al crear/actualizar/borrar, se descuenta o revierte la cantidad usada (kclUsedG) del frasco de reactivo asociado, con validación de saldo."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_SOLUTION_PREP_WEIGHING,
			"Preparación de solución: vínculo con pesada",
			"La entrada de pesada asociada debe pertenecer a la misma entrada (entry) que la preparación de solución."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_KCL_HIGH_PREP_CHAIN,
			"20-108 conductividad alta: cadena Excel (hoja YYYYMMDD), preparación estándar KCl",
			"Por hoja-fecha hay dos bloques con la misma estructura. Bloque 1: C26=C25*B24/C24; E24=C26; E25=B10; "
				+ "F26=(E25*F24)/E24; D29=F26; F30=(D29*F28)/D28; B13=F30. Bloque 2: C56=C55*B54/C54; E54=C56; E55=B40; "
				+ "F56=(E55*F54)/E54; D59=F56; F60=(D59*F58)/D58; B43=F60. "
				+ "Constantes sembradas: KCL_HIGH_C25..F28 (ver conductivity_high_20_108_constants.json). "
				+ "Peso (g) en API: weightGrams; mol calculado en calculatedMol; conductividad teórica (µS/cm) en calculatedValue."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_C25,
			ReferenceParameterDefaults.KCL_HIGH_C25,
			"20-108: celda C25 (constante ref. peso/molaridad paso 1)",
			"Valor escalar para C26=C25*B24/C24."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_B24,
			ReferenceParameterDefaults.KCL_HIGH_B24,
			"20-108: celda B24",
			"Factor en regla de tres paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_C24,
			ReferenceParameterDefaults.KCL_HIGH_C24,
			"20-108: celda C24",
			"Denominador paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_F24,
			ReferenceParameterDefaults.KCL_HIGH_F24,
			"20-108: celda F24",
			"Referencia mol en paso F26=(E25*F24)/E24."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_D28,
			ReferenceParameterDefaults.KCL_HIGH_D28,
			"20-108: celda D28",
			"Denominador en F30=(D29*F28)/D28."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_HIGH_F28,
			ReferenceParameterDefaults.KCL_HIGH_F28,
			"20-108: celda F28",
			"Conductividad patrón (µS/cm) en paso final."
		);
		ensureRef(
			ReferenceParameterCodes.KCL_HIGH_THEORETICAL_U_CM,
			ReferenceParameterDefaults.KCL_HIGH_THEORY_MIN_U_CM,
			ReferenceParameterDefaults.KCL_HIGH_THEORY_MAX_U_CM,
			"20-108: rango aceptación conductividad teórica (µS/cm) con weightGrams",
			"Cuando type=High y weightGrams está informado, in_range compara calculatedValue (µS/cm) con este rango; "
				+ "no es el RF05 mS/cm de lectura directa (RF05_CONDUCTIVITY_HIGH)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_KCL_LOW_PREP_CHAIN,
			"3-CONDUCTIVIDAD BAJA (excel_formulas.json: 3-CONDUCTIVIDAD_BAJA_20-108-01_--CONDUCTIVIDAD_BAJAS.xlsx): hojas YYYYMMDD",
			"Misma topología que conductividad alta: C26=C25*B24/C24; E24=C26; E25=B10; F26=(E25*F24)/E24; D29=F26; "
				+ "F30=(D29*F28)/D28; B13=F30. Bloque 2: C56=C55*B54/C54; E54=C56; E55=B40; F56=(E55*F54)/E54; D59=F56; "
				+ "F60=(D59*F58)/D58; B43=F60. Ver FORMULA_RF05_KCL_HIGH_PREP_CHAIN (equivalente). "
				+ "Constantes KCL_LOW_* en conductivity_low_20_108_constants.json."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_RF05_CB_BD_MCF_ADJUST,
			"3-CONDUCTIVIDAD BAJA BCN (ej. 20-111-01-_--CONDUCTIVIDAD_BAJA_BCN.xlsx): hoja BD",
			"B2=TEXT(Tabla1[[#This Row],[Fecha]],\"DDDD\"); I2=Tabla611[[#This Row],[MCF]]-0.0015 (patrón repetido en filas siguientes). "
				+ "Fuente: excel_formulas.json."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_GASTOS_CE_BD_RANDOM,
			"4 Y 5-GASTOS CE (Carta_de_gastos_conductividad.xlsx): hoja BD",
			"D* = RAND()*(Tabla1[[#This Row],[SUP]]-Tabla1[[#This Row],[INF]])+Tabla1[[#This Row],[INF]]. "
				+ "La API no reproduce RAND(); el negocio de gastos KCl usa otras reglas (ver FORMULA_EXPENSE_KCL_JAR)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_GASTOS_CE_VALOR_LEFT6,
			"4 Y 5-GASTOS CE: columna E en BD",
			"E* = LEFT(Tabla1[[#This Row],[VALOR]],6)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_GASTOS_PH_DISOLUCION_ACCUM,
			"4 Y 5-GASTOS pH (Carta_de_gastos_pH.xlsx): hojas DISOLUCION",
			"Ej. DISOLUCION DE 7,00: C21=G18-B21; C22=C21-B22; C23=C22-B23; … (acumulado restando columna B). Fuente: excel_formulas.json."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_CARTA_HORNO_MES_ENLACE,
			"6-CARTA CONTROL HORNO DE SECADO (Control_de_temperatura_horno_2024-2025.xlsx)",
			"En hojas mensuales con fórmulas: AO40=mes; A71=Y44 (ej. MARZO 2025, ABRIL 2025). Otras hojas sin fórmulas en el extracto."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MHS_FOLIO15_SECUENCIA,
			"11-M-HS-01 (M-HS-01 Uso horno de secado.xlsx): hoja FOLIO 15-200",
			"A12=A11+1; B12=B11; C12=C11; A13=A12+1; B13=B12; C13=C12; … (secuencia de folio y columnas B/C)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MLM_SEMANA_MAS7,
			"12-M-LM-01 (Lavado de material.xlsx): folios con fórmulas",
			"Ej. FOLIO 6: A12=A10+7; A14=A12+7; A16=A14+7; … (incrementos de 7 en columna A)."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MSOL_MACHOTE_FOLIO,
			"14-M-SOL-01 (PREPARACION DE SOLUCIONES..xlsx): hoja MACHOTE",
			"L6=E6+1; E44=L6+1; L44=E44+1; E84=L44+1; L84=E84+1; E121=L84+1; L121=E121+1; E157=L121+1; L157=E157+1."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MSOL_FECHA_BLOQUE,
			"14-M-SOL-01: hojas por fecha (ej. 2024-01-02)",
			"I6=B6; L6=E6+1; B44=B6; E44=L6+1; I44=B6; L44=E44+1; B84=B6; E84=L44+1; … propagación de bloques."
		);
		ensureFormulaRow(
			ReferenceParameterCodes.FORMULA_MSOL_02_BD_INDEX,
			"14-M-SOL-02 (PREPARACION DE SOLUCIONES..xlsx): hoja BD",
			"Fórmulas con INDEX/MATCH y tablas (Tabla111, Tabla312, Tabla413, Tabla514, etc.) para textos compuestos (lotes, bitácoras). "
				+ "Listado completo en excel_formulas.json bajo clave 14-PREPARACION_SOLUCIONES_M-SOL_M-SOL-_02_…"
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_C25,
			ReferenceParameterDefaults.KCL_LOW_C25,
			"20-108-01 CB: celda C25",
			"Escalar cadena KCl baja; ver conductivity_low_20_108_constants.json."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_B24,
			ReferenceParameterDefaults.KCL_LOW_B24,
			"20-108-01 CB: celda B24",
			"Factor paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_C24,
			ReferenceParameterDefaults.KCL_LOW_C24,
			"20-108-01 CB: celda C24",
			"Denominador paso 1."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_F24,
			ReferenceParameterDefaults.KCL_LOW_F24,
			"20-108-01 CB: celda F24",
			"Referencia mol F26."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_D28,
			ReferenceParameterDefaults.KCL_LOW_D28,
			"20-108-01 CB: celda D28",
			"Denominador F30."
		);
		ensureScalarRef(
			ReferenceParameterCodes.KCL_LOW_F28,
			ReferenceParameterDefaults.KCL_LOW_F28,
			"20-108-01 CB: celda F28",
			"Conductividad patrón (µS/cm)."
		);
		ensureRef(
			ReferenceParameterCodes.KCL_LOW_THEORETICAL_U_CM,
			ReferenceParameterDefaults.KCL_LOW_THEORY_MIN_U_CM,
			ReferenceParameterDefaults.KCL_LOW_THEORY_MAX_U_CM,
			"Conductividad baja: rango aceptación conductividad teórica (µS/cm) con weightGrams",
			"Cuando type=Low y weightGrams está informado, in_range compara calculatedValue (µS/cm) con este rango; "
				+ "no es el RF05 mS/cm de lectura directa (RF05_CONDUCTIVITY_LOW)."
		);
		LOGGER.info("Parámetros y definiciones de fórmulas actualizados");
	}

	private void ensureScalarRef(String code, BigDecimal value, String description, String ruleDetail) {
		ensureRef(code, value, value, description, ruleDetail);
	}

	private void ensureRef(String code, BigDecimal min, BigDecimal max, String description, String ruleDetail) {
		if (isBlank(code)) {
			LOGGER.warn("ensureRef omitido: código vacío");
			return;
		}
		if (isBlank(description) || isBlank(ruleDetail)) {
			LOGGER.warn("ensureRef omitido para código {}: descripción o rule_detail vacíos", code);
			return;
		}
		if (min != null && max != null && min.compareTo(max) > 0) {
			LOGGER.warn(
				"ensureRef omitido para código {}: min_value ({}) > max_value ({})",
				code,
				min,
				max
			);
			return;
		}
		ReferenceParameterEntity e = referenceParameterRepository.findByCode(code).orElseGet(() -> {
			ReferenceParameterEntity n = new ReferenceParameterEntity();
			n.setCode(code);
			return n;
		});
		clearSoftDeleteIfPresent(e);
		e.setMinValue(min);
		e.setMaxValue(max);
		e.setDescription(description);
		e.setRuleDetail(ruleDetail);
		referenceParameterRepository.save(e);
	}

	private void ensureFormulaRow(String code, String description, String ruleDetail) {
		if (isBlank(code)) {
			LOGGER.warn("ensureFormulaRow omitido: código vacío");
			return;
		}
		if (isBlank(description) || isBlank(ruleDetail)) {
			LOGGER.warn("ensureFormulaRow omitido para código {}: descripción o rule_detail vacíos", code);
			return;
		}
		ReferenceParameterEntity e = referenceParameterRepository.findByCode(code).orElseGet(() -> {
			ReferenceParameterEntity n = new ReferenceParameterEntity();
			n.setCode(code);
			return n;
		});
		clearSoftDeleteIfPresent(e);
		e.setMinValue(null);
		e.setMaxValue(null);
		e.setDescription(description);
		e.setRuleDetail(ruleDetail);
		referenceParameterRepository.save(e);
	}

	private void initializeSolutionsFromList() {
		LOGGER.info("Asegurando catálogo de soluciones (reactivos) desde listado inicial");
		int added = 0;
		int skipped = 0;
		for (InitialCatalogData.SolutionSeed seed : InitialCatalogData.SOLUTIONS) {
			String name = seed.name() == null ? "" : seed.name().trim();
			if (name.isEmpty()) {
				LOGGER.warn("Fila de solución omitida: nombre vacío");
				skipped++;
				continue;
			}
			String conc = normalizeConcentration(seed.concentration());
			String concKey = conc.isEmpty() ? null : conc;
			Optional<SolutionEntity> existingSol = solutionRepository.findFirstByNameAndConcentrationOrderByIdAsc(name, concKey);
			if (existingSol.isPresent()) {
				SolutionEntity s = existingSol.get();
				if (s.getDeletedAt() != null) {
					clearSoftDeleteIfPresent(s);
					solutionRepository.save(s);
					added++;
				}
				continue;
			}
			SolutionEntity s = new SolutionEntity();
			s.setName(name);
			s.setConcentration(concKey);
			solutionRepository.save(s);
			added++;
		}
		LOGGER.info("Soluciones: {} nuevas; {} filas inválidas omitidas; listado {}", added, skipped, InitialCatalogData.SOLUTIONS.size());
	}

	private static String normalizeConcentration(String concentration) {
		if (concentration == null) {
			return "";
		}
		return concentration.trim();
	}

	private void initializeEquipmentFromList() {
		LOGGER.info("Asegurando catálogo de equipos desde listado inicial");
		int added = 0;
		int skipped = 0;
		for (InitialCatalogData.EquipmentSeed seed : InitialCatalogData.EQUIPMENT) {
			String type = seed.equipmentType() == null ? "" : seed.equipmentType().trim();
			String denom = seed.denomination() == null ? "" : seed.denomination().trim();
			if (type.isEmpty() || denom.isEmpty()) {
				LOGGER.warn("Fila de equipo omitida: tipo o denominación vacíos");
				skipped++;
				continue;
			}
			Optional<LaboratoryEquipmentEntity> existingEq = laboratoryEquipmentRepository.findByDenomination(denom);
			if (existingEq.isPresent()) {
				LaboratoryEquipmentEntity e = existingEq.get();
				if (e.getDeletedAt() != null) {
					clearSoftDeleteIfPresent(e);
					e.setEquipmentType(type);
					laboratoryEquipmentRepository.save(e);
					added++;
				}
				continue;
			}
			LaboratoryEquipmentEntity e = new LaboratoryEquipmentEntity();
			e.setEquipmentType(type);
			e.setDenomination(denom);
			laboratoryEquipmentRepository.save(e);
			added++;
		}
		LOGGER.info("Equipos: {} nuevos; {} filas inválidas omitidas; listado {}", added, skipped, InitialCatalogData.EQUIPMENT.size());
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}

	private static void clearSoftDeleteIfPresent(Auditable a) {
		if (a.getDeletedAt() != null) {
			a.setDeletedAt(null);
			a.setDeletedByUser(null);
		}
	}
}
