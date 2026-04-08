package com.backend.ccasa.security;

import com.backend.ccasa.service.IJWTUtilityService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, prePostEnabled = true)
public class SecurityConfiguration {

	private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfiguration.class);

	private final IJWTUtilityService jwtUtilityService;

	public SecurityConfiguration(IJWTUtilityService jwtUtilityService) {
		this.jwtUtilityService = jwtUtilityService;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http,
			CcasaSecurityPipelineFilter ccasaSecurityPipelineFilter) throws Exception {
		LOGGER.info("Configurando seguridad de la API (JWT)...");

		return http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(
								"/api/v1/auth/login", "/api/v1/auth/register",
								"/api/v1/auth/init-admin", "/api/v1/auth/forgot-password",
								"/v1/auth/login", "/v1/auth/register",
								"/v1/auth/init-admin", "/v1/auth/forgot-password"
						).permitAll()
						.requestMatchers("/api/control/v1/**").hasAuthority("PLATFORM_ADMIN")
						.requestMatchers("/actuator/**").permitAll()
						.requestMatchers("/h2-console/**").permitAll()
						.anyRequest().authenticated())
				.sessionManagement(session ->
						session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.addFilterAt(ccasaSecurityPipelineFilter, UsernamePasswordAuthenticationFilter.class)
				.exceptionHandling(ex -> ex
						.authenticationEntryPoint((request, response, authException) -> {
							LOGGER.warn("Acceso no autorizado a: {} - {}", request.getRequestURI(), authException.getMessage());
							response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
							response.setContentType("application/json");
							response.setCharacterEncoding("UTF-8");
							response.getWriter().write(
									"{\"error\":\"Unauthorized\",\"message\":\"Token de acceso requerido o inválido\"}");
						})
						.accessDeniedHandler((request, response, accessDeniedException) -> {
							LOGGER.warn("Acceso denegado a: {} - {}", request.getRequestURI(), accessDeniedException.getMessage());
							response.setStatus(HttpServletResponse.SC_FORBIDDEN);
							response.setContentType("application/json");
							response.setCharacterEncoding("UTF-8");
							response.getWriter().write(
									"{\"error\":\"Forbidden\",\"message\":\"No tienes permisos para acceder a este recurso\"}");
						}))
				.headers(headers -> headers.frameOptions(f -> f.sameOrigin()))
				.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(List.of(
				"http://localhost:3000",
				"http://localhost:3000",
				"http://127.0.0.1:3000",
				"http://localhost:3002",
				"http://76.13.96.56",
				"http://ccasa.hexvorn.cloud",
				"https://ccasa.hexvorn.cloud"
		));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList(
				"Origin", "Content-Type", "Accept", "Authorization",
				"X-Requested-With", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
		configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public ApiPathRewriteFilter apiPathRewriteFilter() {
		return new ApiPathRewriteFilter();
	}

	@Bean
	public JWTAuthorizationFilter jwtAuthorizationFilter() {
		return new JWTAuthorizationFilter(jwtUtilityService);
	}

	@Bean
	public CcasaSecurityPipelineFilter ccasaSecurityPipelineFilter(
			ApiPathRewriteFilter apiPathRewriteFilter,
			RateLimitingFilter rateLimitingFilter,
			JWTAuthorizationFilter jwtAuthorizationFilter) {
		return new CcasaSecurityPipelineFilter(apiPathRewriteFilter, rateLimitingFilter, jwtAuthorizationFilter);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}
}
