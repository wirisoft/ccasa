package com.backend.ccasa.exceptions;

/**
 * Excepción para reglas de negocio violadas (ej. transiciones de estado inválidas, firmas duplicadas).
 */
public class BusinessRuleException extends RuntimeException {

	private final String code;

	public BusinessRuleException(String code, String message) {
		super(message);
		this.code = code;
	}

	public String getCode() {
		return code;
	}
}
