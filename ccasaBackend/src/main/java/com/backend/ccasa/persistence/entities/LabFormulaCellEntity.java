package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Catálogo de celdas con fórmula en los libros Excel del manifiesto (una fila por libro JSON + hoja + celda).
 * No representa datos de negocio (folios, muestras).
 */
@Entity
@Table(
	name = "lab_formula_cell",
	uniqueConstraints = @UniqueConstraint(name = "uk_lab_formula_cell_code", columnNames = "code")
)
public class LabFormulaCellEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "formula_cell_id")
	private Long id;

	/** Código estable FC + hex (ver {@link com.backend.ccasa.utils.FormulaCellCodeHash}). */
	@Column(name = "code", nullable = false, length = 40)
	private String code;

	/** Clave del libro en excel_formulas.json (p. ej. nombre de archivo normalizado). */
	@Column(name = "file_key", nullable = false, columnDefinition = "TEXT")
	private String fileKey;

	@Column(name = "sheet_name", nullable = false, columnDefinition = "TEXT")
	private String sheetName;

	@Column(name = "cell_ref", nullable = false, length = 32)
	private String cellRef;

	@Column(name = "formula_text", nullable = false, columnDefinition = "TEXT")
	private String formulaText;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getFileKey() {
		return fileKey;
	}

	public void setFileKey(String fileKey) {
		this.fileKey = fileKey;
	}

	public String getSheetName() {
		return sheetName;
	}

	public void setSheetName(String sheetName) {
		this.sheetName = sheetName;
	}

	public String getCellRef() {
		return cellRef;
	}

	public void setCellRef(String cellRef) {
		this.cellRef = cellRef;
	}

	public String getFormulaText() {
		return formulaText;
	}

	public void setFormulaText(String formulaText) {
		this.formulaText = formulaText;
	}
}
