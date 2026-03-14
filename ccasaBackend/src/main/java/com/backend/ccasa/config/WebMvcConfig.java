package com.backend.ccasa.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ForwardedHeaderFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración Web MVC. ForwardedHeaderFilter procesa X-Forwarded-*
 * para correcto uso detrás de proxy/load balancer.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	private static final Logger LOGGER = LoggerFactory.getLogger(WebMvcConfig.class);

	@Bean
	public ForwardedHeaderFilter forwardedHeaderFilter() {
		LOGGER.info("ForwardedHeaderFilter registrado para soporte de proxy/load balancer");
		return new ForwardedHeaderFilter();
	}
}
