package com.backend.ccasa.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Código estable por celda (libro JSON + hoja + celda), alineado con {@code build_formula_cell_catalog.py}.
 */
public final class FormulaCellCodeHash {

	private static final char UNIT_SEP = '\u001f';

	private FormulaCellCodeHash() {
	}

	public static String codeFor(String fileKey, String sheetName, String cellRef) {
		if (fileKey == null || sheetName == null || cellRef == null) {
			throw new IllegalArgumentException("fileKey, sheetName y cellRef son obligatorios");
		}
		String payload = fileKey + UNIT_SEP + sheetName + UNIT_SEP + cellRef;
		byte[] digest;
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			digest = md.digest(payload.getBytes(StandardCharsets.UTF_8));
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("SHA-256 no disponible", e);
		}
		StringBuilder hex = new StringBuilder(64);
		for (byte b : digest) {
			hex.append(String.format("%02x", b));
		}
		return "FC" + hex.substring(0, 32);
	}
}
