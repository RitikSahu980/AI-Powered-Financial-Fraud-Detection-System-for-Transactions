package com.frauddetection.backend.config.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration for reaching the Python ML microservice.
 *
 * @param baseUrl            Base URL of the Python ML microservice.
 * @param predictPath         Path of the prediction endpoint, appended to baseUrl.
 * @param healthPath          Path of the ML service's own health endpoint.
 * @param connectTimeoutMs   Max time to establish a TCP connection to the ML service.
 * @param responseTimeoutMs  Max time to wait for the full prediction response.
 */
@Validated
@ConfigurationProperties(prefix = "ml-service")
public record MlServiceProperties(
        @NotBlank String baseUrl,
        @NotBlank String predictPath,
        @NotBlank String healthPath,
        @Positive int connectTimeoutMs,
        @Positive int responseTimeoutMs
) {
}
