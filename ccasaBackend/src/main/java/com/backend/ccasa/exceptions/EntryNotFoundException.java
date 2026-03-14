package com.backend.ccasa.exceptions;

/**
 * Excepción de negocio cuando no se encuentra una entrada.
 */
public class EntryNotFoundException extends RuntimeException {

	public EntryNotFoundException(Long entryId) {
		super("Entry not found: " + entryId);
	}
}
