package com.backend.ccasa.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limits requests to public auth endpoints (login, register, forgot-password) per client IP.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

	private static final int MAX_REQUESTS_PER_MINUTE = 10;

	private final Cache<String, AtomicInteger> requestCounts = Caffeine.newBuilder()
			.expireAfterWrite(Duration.ofMinutes(1))
			.maximumSize(10_000)
			.build();

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain)
			throws ServletException, IOException {

		String path = request.getRequestURI();
		boolean isRateLimited = SecurityPathPatterns.isAuthRateLimitedPath(path);

		if (!isRateLimited) {
			filterChain.doFilter(request, response);
			return;
		}

		String clientIp = getClientIp(request);
		String cacheKey = clientIp + ":" + path;

		AtomicInteger counter = requestCounts.get(cacheKey, k -> new AtomicInteger(0));
		int count = counter.incrementAndGet();

		if (count > MAX_REQUESTS_PER_MINUTE) {
			response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(
					"{\"status\":429,\"message\":\"Demasiadas solicitudes. Intenta de nuevo en un minuto.\",\"timestamp\":\""
							+ Instant.now() + "\"}"
			);
			return;
		}

		filterChain.doFilter(request, response);
	}

	private String getClientIp(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			return forwarded.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}
}
