package com.backend.ccasa.security;

/**
 * Rutas públicas alineadas entre {@code authorizeHttpRequests} y el salto del JWT.
 * Incluye {@code /v1/auth/...} para cuando nginx quita el prefijo {@code /api}.
 */
public final class SecurityPathPatterns {

	private SecurityPathPatterns() {
	}

	/** Auth anónima (login, register, init-admin, forgot-password). No incluye change-password (requiere JWT). */
	public static boolean isAuthPublicPath(String path) {
		if (path == null) {
			return false;
		}
		return isPublicAuthEndpoint(path, "/api/v1/auth/")
				|| isPublicAuthEndpoint(path, "/v1/auth/");
	}

	/** No exigir JWT: auth pública, actuator, error, consola H2. */
	public static boolean isPublicForJwt(String path) {
		if (path == null) {
			return false;
		}
		if (isAuthPublicPath(path)) {
			return true;
		}
		return path.startsWith("/actuator/")
				|| path.startsWith("/error")
				|| path.startsWith("/h2-console/");
	}

	public static boolean isAuthRateLimitedPath(String path) {
		if (path == null) {
			return false;
		}
		return path.equals("/api/v1/auth/login")
				|| path.equals("/api/v1/auth/register")
				|| path.equals("/api/v1/auth/forgot-password")
				|| path.equals("/v1/auth/login")
				|| path.equals("/v1/auth/register")
				|| path.equals("/v1/auth/forgot-password");
	}

	private static boolean isPublicAuthEndpoint(String path, String prefix) {
		if (!path.startsWith(prefix)) {
			return false;
		}
		String sub = path.substring(prefix.length());
		return sub.equals("login")
				|| sub.equals("register")
				|| sub.equals("init-admin")
				|| sub.equals("forgot-password");
	}
}
