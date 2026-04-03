package com.backend.ccasa.exceptions;

/**
 * Credenciales inválidas o usuario inactivo (login).
 */
public class AuthenticationFailedException extends RuntimeException {

	public AuthenticationFailedException(String message) {
		super(message);
	}
}
