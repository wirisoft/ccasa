package com.backend.ccasa.exceptions;

/**
 * Excepción de negocio cuando no se encuentra un folio.
 */
public class FolioNotFoundException extends RuntimeException {

	public FolioNotFoundException(Long id) {
		super("Folio not found: " + id);
	}
}
