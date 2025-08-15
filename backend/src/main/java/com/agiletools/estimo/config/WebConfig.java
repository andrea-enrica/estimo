package com.agiletools.estimo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${application.allowed-origins}")
    private String applicationAllowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] allowedOrigins = applicationAllowedOrigins.split(",");

        registry.addMapping("/**").
                allowedOrigins(allowedOrigins).
                allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS").
                allowedHeaders("*").
                allowCredentials(true);
    }
}