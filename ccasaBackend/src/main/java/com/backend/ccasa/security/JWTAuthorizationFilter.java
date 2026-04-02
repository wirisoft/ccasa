package com.backend.ccasa.security;

import com.backend.ccasa.service.IJWTUtilityService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Filtro que valida el JWT en cada petición y establece el SecurityContext
 * con CcasaUserDetails (userId, email, tenantId, roles).
 */
public class JWTAuthorizationFilter extends OncePerRequestFilter implements Ordered {

	private static final Logger LOGGER = LoggerFactory.getLogger(JWTAuthorizationFilter.class);

	private final IJWTUtilityService jwtUtilityService;

	public JWTAuthorizationFilter(IJWTUtilityService jwtUtilityService) {
		this.jwtUtilityService = jwtUtilityService;
	}

	@Override
	public int getOrder() {
		return SecurityFilterOrder.JWT_AUTHORIZATION;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			filterChain.doFilter(request, response);
			return;
		}

		if (isPublicEndpoint(request.getRequestURI())) {
			filterChain.doFilter(request, response);
			return;
		}

		String token = extractToken(request);
		if (token == null || token.isEmpty()) {
			LOGGER.warn("Token ausente en ruta protegida: uri={}", request.getRequestURI());
			sendUnauthorized(response, "Token requerido");
			return;
		}

		try {
			JWTClaimsSet claims = jwtUtilityService.parseJWT(token);

			String userId = claims.getSubject();
			String email = claims.getStringClaim("email");
			String role = claims.getStringClaim("role");
			String name = claims.getStringClaim("name");
			String lastName = claims.getStringClaim("lastName");
			Long tenantId = extractLongClaim(claims, "tenantId");
			if (tenantId == null) {
				tenantId = extractLongClaim(claims, "academyId");
			}

			if (role == null || role.trim().isEmpty()) {
				role = "USER";
			}

			if (!areClaimsValid(userId, email)) {
				LOGGER.warn("JWT con claims incompletos: subject={}, email={}", userId != null, email != null);
				sendUnauthorized(response, "Claims incompletos o inválidos");
				return;
			}

			List<String> roles = getStringListClaim(claims, "roles");
			List<String> permissions = getStringListClaim(claims, "permissions");

			List<SimpleGrantedAuthority> authorities = new ArrayList<>();
			authorities.add(new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase()));
			if (roles != null) {
				for (String r : roles) {
					if (r != null && !r.isBlank()) {
						authorities.add(new SimpleGrantedAuthority("ROLE_" + r.trim().toUpperCase()));
					}
				}
			}
			if (permissions != null) {
				for (String p : permissions) {
					if (p != null && !p.isBlank()) {
						authorities.add(new SimpleGrantedAuthority(p.trim()));
					}
				}
			}

			CcasaUserDetails userDetails = new CcasaUserDetails(
					userId, email, role, name, lastName, tenantId,
					roles != null ? roles : Collections.emptyList(),
					permissions != null ? permissions : Collections.emptyList());

			UsernamePasswordAuthenticationToken authToken =
					new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

			SecurityContextHolder.getContext().setAuthentication(authToken);
			LOGGER.debug("Usuario autenticado: {} (tenantId: {})", email, tenantId);

		} catch (JOSEException | ParseException | NoSuchAlgorithmException | InvalidKeySpecException e) {
			LOGGER.error("Error al validar JWT: {}", e.getMessage());
			sendUnauthorized(response, e.getMessage());
			return;
		}

		filterChain.doFilter(request, response);
	}

	private String extractToken(HttpServletRequest request) {
		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith("Bearer ")) {
			return header.substring(7);
		}
		String tokenParam = request.getParameter("token");
		if (tokenParam != null && !tokenParam.isEmpty()) {
			return tokenParam;
		}
		return null;
	}

	private Long extractLongClaim(JWTClaimsSet claims, String claimName) {
		try {
			Object value = claims.getClaim(claimName);
			if (value instanceof Number) {
				return ((Number) value).longValue();
			}
		} catch (Exception e) {
			LOGGER.debug("Error parseando claim '{}': {}", claimName, e.getMessage());
		}
		return null;
	}

	@SuppressWarnings("unchecked")
	private List<String> getStringListClaim(JWTClaimsSet claims, String claimName) {
		try {
			Object value = claims.getClaim(claimName);
			if (value instanceof List) {
				return (List<String>) value;
			}
		} catch (Exception e) {
			LOGGER.debug("Error leyendo claim '{}': {}", claimName, e.getMessage());
		}
		return null;
	}

	private boolean isPublicEndpoint(String path) {
		if (path == null) {
			return false;
		}
		return path.startsWith("/api/v1/auth/")
				|| path.startsWith("/actuator/")
				|| path.startsWith("/error")
				|| path.startsWith("/h2-console/");
	}

	private boolean areClaimsValid(String subject, String email) {
		return subject != null && !subject.isBlank() && email != null && !email.isBlank();
	}

	private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + escapeJson(message) + "\"}");
	}

	private String escapeJson(String s) {
		if (s == null) return "";
		return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
	}
}
