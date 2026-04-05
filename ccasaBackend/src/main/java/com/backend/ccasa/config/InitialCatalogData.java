package com.backend.ccasa.config;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Filas iniciales idempotentes para soluciones (reactivos) y equipos de laboratorio.
 * Alineado con listados REACTIVOS / EQUIPOS (Listados.xlsx).
 */
public final class InitialCatalogData {

	public record SolutionSeed(String name, String concentration) {
	}

	public record EquipmentSeed(String equipmentType, String denomination) {
	}

	static String solutionKey(String name, String concentration) {
		String n = name == null ? "" : name.trim();
		String c = concentration == null ? "" : concentration.trim();
		return n + "|" + c;
	}

	/**
	 * Catálogo de soluciones: nombre + concentración (columnas SOLUCION, CONCENTRACION).
	 */
	public static final List<SolutionSeed> SOLUTIONS = List.of(
		new SolutionSeed("NaOH", "0.1 N"),
		new SolutionSeed("NaOH", "0.5 N"),
		new SolutionSeed("NaOH", "1 N"),
		new SolutionSeed("HCl", "0.1 N"),
		new SolutionSeed("HCl", "0.01 N"),
		new SolutionSeed("Hipoclorito de sodio", "5 %"),
		new SolutionSeed("Buffer pH", "4.00"),
		new SolutionSeed("Buffer pH", "7.00"),
		new SolutionSeed("Buffer pH", "9.18"),
		new SolutionSeed("Disolución patrón CE", "alta"),
		new SolutionSeed("Disolución patrón CE", "baja"),
		new SolutionSeed("KCl", "saturado"),
		new SolutionSeed("Agua destilada", "grado reactivo"),
		new SolutionSeed("Etilenglicol", "técnico"),
		new SolutionSeed("Solución conductividad alta", "referencia"),
		new SolutionSeed("Solución conductividad baja", "referencia")
	);

	/**
	 * Equipos: tipo + denominación (activos SA-…).
	 */
	public static final List<EquipmentSeed> EQUIPMENT = List.of(
		new EquipmentSeed("POTENCIOMETRO", "SA-pH-02"),
		new EquipmentSeed("CONDUCTIMETRO", "SA-CD-01"),
		new EquipmentSeed("HORNO", "SA-HS-03"),
		new EquipmentSeed("BALANZA ANALITICA", "SA-BA-01"),
		new EquipmentSeed("BALANZA DE PRECISION", "SA-BP-01"),
		new EquipmentSeed("ESTUFA", "SA-ES-01"),
		new EquipmentSeed("AGITADOR", "SA-AG-01"),
		new EquipmentSeed("REFRIGERADOR", "SA-RF-01")
	);

	static {
		validateSeedLists();
	}

	/**
	 * Comprueba duplicados y campos obligatorios en los listados estáticos; falla al cargar la clase si el catálogo es inconsistente.
	 */
	private static void validateSeedLists() {
		Set<String> solutionKeys = new HashSet<>();
		for (SolutionSeed s : SOLUTIONS) {
			String n = s.name() == null ? "" : s.name().trim();
			if (n.isEmpty()) {
				throw new IllegalStateException("InitialCatalogData: nombre de solución vacío");
			}
			String key = solutionKey(s.name(), s.concentration());
			if (!solutionKeys.add(key)) {
				throw new IllegalStateException("InitialCatalogData: solución duplicada (nombre + concentración): " + key);
			}
		}
		Set<String> denoms = new HashSet<>();
		for (EquipmentSeed e : EQUIPMENT) {
			String t = e.equipmentType() == null ? "" : e.equipmentType().trim();
			if (t.isEmpty()) {
				throw new IllegalStateException("InitialCatalogData: tipo de equipo vacío");
			}
			String d = e.denomination() == null ? "" : e.denomination().trim();
			if (d.isEmpty()) {
				throw new IllegalStateException("InitialCatalogData: denominación de equipo vacía");
			}
			if (!denoms.add(d)) {
				throw new IllegalStateException("InitialCatalogData: denominación de equipo duplicada: " + d);
			}
		}
	}

	private InitialCatalogData() {
	}
}
