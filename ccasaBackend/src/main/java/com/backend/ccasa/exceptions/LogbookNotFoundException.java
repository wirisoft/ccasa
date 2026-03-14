package com.backend.ccasa.exceptions;

/**
 * Excepción de negocio cuando no se encuentra una bitácora.
 */
public class LogbookNotFoundException extends RuntimeException {

	public LogbookNotFoundException(Long id) {
		super("Logbook not found: " + id);
	}
}
