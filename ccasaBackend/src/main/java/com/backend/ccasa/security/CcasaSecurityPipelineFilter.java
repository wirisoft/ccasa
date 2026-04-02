package com.backend.ccasa.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.springframework.core.Ordered;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

/**
 * Encadena ApiPathRewrite → RateLimiting → JWT en un solo filtro registrado con
 * {@link org.springframework.security.config.annotation.web.builders.HttpSecurity#addFilterAt},
 * cumpliendo {@code FilterOrderRegistration} de Spring Security 7.
 */
public class CcasaSecurityPipelineFilter extends GenericFilterBean implements Ordered {

	private final ApiPathRewriteFilter apiPathRewriteFilter;
	private final RateLimitingFilter rateLimitingFilter;
	private final JWTAuthorizationFilter jwtAuthorizationFilter;

	public CcasaSecurityPipelineFilter(
			ApiPathRewriteFilter apiPathRewriteFilter,
			RateLimitingFilter rateLimitingFilter,
			JWTAuthorizationFilter jwtAuthorizationFilter) {
		this.apiPathRewriteFilter = apiPathRewriteFilter;
		this.rateLimitingFilter = rateLimitingFilter;
		this.jwtAuthorizationFilter = jwtAuthorizationFilter;
	}

	@Override
	public int getOrder() {
		return SecurityFilterOrder.PRE_AUTHENTICATION_PIPELINE;
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		apiPathRewriteFilter.doFilter(request, response, (req, res) ->
				rateLimitingFilter.doFilter(req, res, (req2, res2) ->
						jwtAuthorizationFilter.doFilter(req2, res2, chain)));
	}
}
