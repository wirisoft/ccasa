package com.backend.ccasa.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Cuando nginx hace {@code proxy_pass} a Tomcat quitando el prefijo {@code /api},
 * la petición llega como {@code /v1/...} pero los controladores mapean {@code /api/v1/...}.
 * Este filtro restaura el prefijo para toda la cadena posterior (rate limit, JWT, MVC).
 */
public class ApiPathRewriteFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String uri = request.getRequestURI();
		if (uri == null || !uri.startsWith("/v1/") || uri.startsWith("/api/")) {
			filterChain.doFilter(request, response);
			return;
		}

		final String rewritten = "/api" + uri;
		HttpServletRequest wrapped = new HttpServletRequestWrapper(request) {
			@Override
			public String getRequestURI() {
				return rewritten;
			}

			@Override
			public String getServletPath() {
				return rewritten;
			}

			@Override
			public String getPathInfo() {
				return null;
			}
		};
		filterChain.doFilter(wrapped, response);
	}
}
