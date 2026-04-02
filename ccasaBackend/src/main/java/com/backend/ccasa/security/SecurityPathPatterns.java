package com.backend.ccasa.security;

/**
 * Rutas públicas alineadas entre {@code authorizeHttpRequests} y el salto del JWT.
 * Incluye {@code /v1/auth/...} para cuando nginx quita el prefijo {@code /api}.
 */
public final class SecurityPathPatterns {

	private SecurityPathPatterns() {
	}

	/** Auth anónima (login, register, init-admin, etc.). */
	public static boolean isAuthPublicPath(String path) {
		if (path == null) {
			return false;
		}
		return path.startsWith("/api/v1/auth/") || path.startsWith("/v1/auth/");
	}

	/** No exigir JWT: auth, actuator, error, consola H2. */
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
}
