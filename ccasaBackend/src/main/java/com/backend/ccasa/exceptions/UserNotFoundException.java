package com.backend.ccasa.exceptions;

/**
 * Excepción de negocio cuando no se encuentra un usuario.
 */
public class UserNotFoundException extends RuntimeException {

	public UserNotFoundException(Long id) {
		super("User not found: " + id);
	}
}
