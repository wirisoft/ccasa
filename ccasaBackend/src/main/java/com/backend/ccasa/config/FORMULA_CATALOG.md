# Catálogo de fórmulas Excel (semilla de BD)

## Qué se inserta

- **Parámetros de referencia** (`lab_reference_parameter`): límites RF, constantes numéricas acordadas, textos `FORMULA_*` documentales cuando apliquen.
- **Catálogo por celda** (`lab_formula_cell`): una fila por cada **celda con fórmula** en los libros listados en `excel_file_manifest.py`, generado desde `excel_formulas.json` (sin datos de negocio: no folios, no filas de muestras, no “iteraciones” de registros operativos).

## Qué no se inserta aquí

- Entradas de bitácora, folios, firmas ni ningún dato transaccional del laboratorio.

## Regenerar el catálogo

1. (Opcional) Regenerar `excel_formulas.json`: `python extract_excel_formulas.py` con los `.xlsx` en `filesproyect`.
2. Generar el JSONL: `python build_formula_cell_catalog.py` en la raíz del repo.
3. Copiar o enlazar `formula_cells.jsonl` a `ccasaBackend/src/main/resources/catalog/formula_cells.jsonl` para que el arranque cargue en BD vacía.

Si el recurso no existe, el arranque omite la carga y deja un aviso en log.

Propiedad: `ccasa.formula-catalog.seed-enabled` (por defecto `true`). Desactívala para no insertar el catálogo al arrancar.

`extract_excel_formulas.py` limita fórmulas por hoja (actualmente 50 000). Si alguna hoja supera el tope, sube el límite y regenera `excel_formulas.json` antes de volver a ejecutar `build_formula_cell_catalog.py`.
