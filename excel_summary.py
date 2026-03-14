# -*- coding: utf-8 -*-
import json
from pathlib import Path

p = Path(r"C:\Users\misju\ccasa\excel_analysis.json")
data = json.loads(p.read_text(encoding="utf-8"))
out = []
for file_key, file_data in data.items():
    if "error" in file_data:
        out.append(f"## {file_key}\nError: {file_data['error']}\n")
        continue
    out.append(f"## {file_key}\nPath: {file_data.get('path', '')}\n")
    for sheet_name, sheet_data in file_data.get("sheets", {}).items():
        out.append(f"\n### Hoja: {sheet_name}")
        out.append(f"  Filas: {sheet_data.get('max_row', 0)}, Columnas: {sheet_data.get('max_col', 0)}")
        headers = sheet_data.get("headers", [])
        # filter empty trailing
        while headers and headers[-1] == "":
            headers = headers[:-1]
        if headers:
            out.append("  Columnas: " + " | ".join(h if h else "(vacío)" for h in headers[:35]))
        sample = sheet_data.get("sample_rows", [])[:3]
        if sample:
            out.append("  Muestra filas (primeras celdas):")
            for i, row in enumerate(sample):
                non_empty = [str(c)[:20] for c in row[:15] if c]
                if non_empty:
                    out.append("    Fila " + str(i+2) + ": " + ", ".join(non_empty[:12]))
    out.append("\n---\n")
Path(r"C:\Users\misju\ccasa\excel_analysis_summary.md").write_text("\n".join(out), encoding="utf-8")
print("Summary written to excel_analysis_summary.md")
