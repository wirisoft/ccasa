package com.backend.ccasa.security;

/**
 * Órdenes registrados para filtros propios en Spring Security 7.
 * Valores menores se ejecutan antes en la cadena (petición entrante).
 * Deben quedar por debajo del orden del {@link org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter}
 * (típicamente 1100).
 */
public final class SecurityFilterOrder {

	private SecurityFilterOrder() {
	}

	private static final int USERNAME_PASSWORD_AUTH_FILTER = 1100;

	public static final int API_PATH_REWRITE = USERNAME_PASSWORD_AUTH_FILTER - 30;

	public static final int RATE_LIMITING = USERNAME_PASSWORD_AUTH_FILTER - 20;

	public static final int JWT_AUTHORIZATION = USERNAME_PASSWORD_AUTH_FILTER - 10;
}
