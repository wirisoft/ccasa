package com.backend.ccasa.security;

/**
 * Orden del pipeline previo a la autenticación por formulario.
 * Debe quedar antes de {@link org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter}
 * (orden típico 1100 en Spring Security 7).
 */
public final class SecurityFilterOrder {

	private SecurityFilterOrder() {
	}

	private static final int USERNAME_PASSWORD_AUTH_FILTER = 1100;

	/** Filtro compuesto: reescritura de ruta, rate limit y JWT. */
	public static final int PRE_AUTHENTICATION_PIPELINE = USERNAME_PASSWORD_AUTH_FILTER - 10;
}
