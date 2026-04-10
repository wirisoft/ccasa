package com.backend.ccasa.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ForwardedHeaderFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry; // Añadir esta
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final Logger LOGGER = LoggerFactory.getLogger(WebMvcConfig.class);

    @Bean
    public ForwardedHeaderFilter forwardedHeaderFilter() {
        LOGGER.info("ForwardedHeaderFilter registrado para soporte de proxy/load balancer");
        return new ForwardedHeaderFilter();
    }

    // AÑADE ESTO PARA PERMITIR LA CONEXIÓN DESDE TU FRONTEND
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // En producción pon la IP específica o dominio
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
        LOGGER.info("CORS configurado para permitir peticiones externas");
    }
}
