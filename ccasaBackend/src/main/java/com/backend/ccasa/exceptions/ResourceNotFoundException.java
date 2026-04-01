package com.backend.ccasa.exceptions;

public class ResourceNotFoundException extends RuntimeException {

	private final String code;

	public ResourceNotFoundException(String resourceCode, Long id) {
		super(resourceCode + " not found: " + id);
		this.code = resourceCode + "_NOT_FOUND";
	}

	public String getCode() {
		return code;
	}
}
