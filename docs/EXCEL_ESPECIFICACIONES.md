# Especificaciones de plantillas Excel (Bitácoras)

Resumen de hojas y columnas de datos por tipo de archivo, para importación/exportación y trazabilidad con el MER.

## 1-AGUA DESTILADA 1-MT (1-MT-02, 1-MT-03)

- **Hojas**: PORTADA (1-MT/02 o 1-MT/03), BITACORA, RECONOCIMIENTO DE FIRMAS, MACHOTE, F 1-2 … 96-200 o 01-200.
- **Hoja BD**:
  - **1-MT-02**: FOLIO | PH | CE | (vacío) | INICIALES | FIRMA (~107 filas).
  - **1-MT-03**: FOLIO | PH | CE | (vacío) | INICIALES | FIRMA | (vacío) | ENAYO | INF | SUP | (vacío) | FOLIO | PH | CE (~201 filas).
- **Mapeo**: ENTRY_DISTILLED_WATER (ph_reading_1/2/3, ce_reading_1/2/3, ph_average, ce_average, water_batch_id), BATCH.

## 2-CONDUCTIVIDAD ALTA (20-108 … 20-114)

- **Hojas**: PORTADA, BITACORA, RECONOCIMIENTO DE FIRMAS, una hoja por fecha **YYYYMMDD** (60×14).
- **Datos**: por hoja/fecha; 14 columnas (lecturas, valores calculados, rangos).
- **Mapeo**: ENTRY_CONDUCTIVITY (type High), RF-05.

## 3-CONDUCTIVIDAD BAJA (20-108-01 … 20-114-01, BCN)

- Igual que conductividad alta (hojas por YYYYMMDD).
- **Hoja BD** (en 20-111-01 BCN, 20-112-01, 20-113-01, 20-114-01): Fecha | Dia | F DISOLVENTE | F BALANZA | F HORNO | (vacío) | Fecha | MCF | SIGMA - ALDRICH | (vacío) | SIGMA - ALDRICH (~753 filas).
- **Mapeo**: ENTRY_CONDUCTIVITY (type Low).

## 4 Y 5-GASTOS (CE, PH)

- **Carta gastos CE**: BD = ENAYO | INF | SUP | VALOR | ALEATORIO (SAL CE ALTA/BAJA, rangos). Hojas HANNA, SIGMA ALDRICH, MCF 1…25.
- **Carta gastos pH**: DISOLUCION DE 7,00 y DISOLUCION DE 9,18.
- **Mapeo**: ENTRY_EXPENSE_CHART, rangos referencia.

## 6-CARTA CONTROL HORNO DE SECADO

- **Hojas**: MACHOTE (91×49), una por mes (ENERO 2024 … DICIEMBRE 2025/2026). Equipo, Clave, días del mes.
- **Mapeo**: ENTRY_OVEN_TEMP, RF-10, UI-02.

## 11-REGISTRO HORNO SECADO M-HS (M-HS-01)

- **Hojas**: PORTADA, BITACORA, RECONOCIMIENTO DE FIRMAS, MACHOTE, FOLIO 1 … FOLIO 14, FOLIO 15-200 (47–57×6). Titulo, clave.
- **Mapeo**: ENTRY_DRYING_OVEN (reagent_id, entry_time, exit_time, analyst_user_id, supervisor_user_id, meets_temp).

## 12-LAVADO MATERIAL M-LM (M-LM-01)

- **Hoja BD**: FECHA | NO. DE PIEZAS | (vacío) | FECHA | NO. DE PIEZAS | G: | F: | (vacío) | FECHA | ALEATORIO G | ALEATORIO F | M1 | M2 | (vacío) | F | BIT | Columna1 | N1…N4 | (vacío) | GARRAFAS | (vacío) | FRASCOS (28 cols, ~201 filas).
- **Mapeo**: ENTRY_MATERIAL_WASH (monday_date, piece_type Carboy/Flask, material, determination, color, analyst_user_id, supervisor_user_id).

## 14-PREPARACION SOLUCIONES M-SOL (01, 02)

- **M-SOL- 01**: hojas por fecha (2024-01-02 … 2025-08-02), ~989–996×26.
- **M-SOL- 02 BD**: # | F | SOLUCION | CONCENTRACION | CANTIDAD | CLAVE | CALCULOS | O1…O4 | AGUA DESTILADA | NaOH | BALANZA ANALITICA | … (78 cols, ~201 filas).
- **Mapeo**: ENTRY_SOLUTION_PREP, ENTRY_WEIGHING, SOLUTION (name, concentration, quantity, clave).

## Listados.xlsx

- **Reactivos y Equipos**: REACTIVOS (SOLUCION, CONCENTRACION), EQUIPOS (EQUIPOS, DENOMINACION).
- **Personal**: ANALISTA (Analistas, Nombre), MUESTREADOR (Muestreador, Nombre), SUPERVISORES (Puesto). Iniciales y nombres.
- **Uso**: catálogos REAGENT, SOLUTION, USER (iniciales/roles).
