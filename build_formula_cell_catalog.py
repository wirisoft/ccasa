# -*- coding: utf-8 -*-
"""
Construye el catálogo por celda a partir de excel_formulas.json (misma clave que extract_excel_formulas).

Salidas (raíz del repo):
  - formula_cells.jsonl: una línea JSON por celda con fórmula
  - formula_catalog_stats.json: totales y truncados

Código estable FC + 32 hex (SHA-256 truncado) del trío file_key + unit separator + sheet + unit separator + cell.
Debe coincidir con FormulaCellCodeHash.java.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FORMULAS_JSON = ROOT / "excel_formulas.json"
OUT_JSONL = ROOT / "formula_cells.jsonl"
OUT_STATS = ROOT / "formula_catalog_stats.json"
BACKEND_CATALOG = ROOT / "ccasaBackend" / "src" / "main" / "resources" / "catalog" / "formula_cells.jsonl"


def cell_code(file_key: str, sheet_name: str, cell_ref: str) -> str:
    raw = f"{file_key}\u001f{sheet_name}\u001f{cell_ref}".encode("utf-8")
    return "FC" + hashlib.sha256(raw).hexdigest()[:32]


def main() -> None:
    if not FORMULAS_JSON.is_file():
        print(f"No existe {FORMULAS_JSON}; ejecute extract_excel_formulas.py primero.", file=sys.stderr)
        sys.exit(2)

    data = json.loads(FORMULAS_JSON.read_text(encoding="utf-8"))
    total = 0
    workbooks = 0
    truncated_sheets: dict[str, list[str]] = {}

    OUT_JSONL.parent.mkdir(parents=True, exist_ok=True)
    with OUT_JSONL.open("w", encoding="utf-8") as out:
        for file_key, payload in data.items():
            if not isinstance(payload, dict):
                continue
            if "error" in payload:
                continue
            sheets = payload.get("sheets")
            if not isinstance(sheets, dict):
                continue
            workbooks += 1
            tr = payload.get("truncated") or {}
            for sheet_name, sheet_data in sheets.items():
                if isinstance(tr, dict) and tr.get(sheet_name):
                    truncated_sheets.setdefault(file_key, []).append(sheet_name)
                formulas = sheet_data.get("formulas") if isinstance(sheet_data, dict) else None
                if not formulas:
                    continue
                for item in formulas:
                    if not isinstance(item, dict):
                        continue
                    cell_ref = item.get("cell")
                    formula = item.get("formula")
                    if not cell_ref or formula is None:
                        continue
                    code = cell_code(file_key, sheet_name, str(cell_ref))
                    line = {
                        "code": code,
                        "fileKey": file_key,
                        "sheetName": sheet_name,
                        "cellRef": str(cell_ref),
                        "formulaText": str(formula),
                    }
                    out.write(json.dumps(line, ensure_ascii=False) + "\n")
                    total += 1

    stats = {
        "formula_cells_total": total,
        "workbooks_with_sheets": workbooks,
        "truncated_sheet_keys": truncated_sheets,
        "source": str(FORMULAS_JSON),
    }
    OUT_STATS.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Escrito: {OUT_JSONL} ({total} filas)")
    print(f"Escrito: {OUT_STATS}")

    BACKEND_CATALOG.parent.mkdir(parents=True, exist_ok=True)
    BACKEND_CATALOG.write_bytes(OUT_JSONL.read_bytes())
    print(f"Copiado a: {BACKEND_CATALOG}")


if __name__ == "__main__":
    main()
