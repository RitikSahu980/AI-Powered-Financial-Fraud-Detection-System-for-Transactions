package com.frauddetection.backend.config.properties;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Risk-level classification thresholds, applied to the {@code fraud_probability}
 * returned by the ML service.
 *
 * @param mediumRiskMinProbability fraud_probability at or above this value (and
 *                                 below {@code highRiskMinProbability}) is Medium risk.
 * @param highRiskMinProbability   fraud_probability at or above this value is High risk.
 *                                 Everything below {@code mediumRiskMinProbability} is Low risk.
 */
@Validated
@ConfigurationProperties(prefix = "risk.thresholds")
public record RiskThresholdProperties(
        @DecimalMin("0.0") @DecimalMax("1.0") double mediumRiskMinProbability,
        @DecimalMin("0.0") @DecimalMax("1.0") double highRiskMinProbability
) {

    public RiskThresholdProperties {
        if (mediumRiskMinProbability >= highRiskMinProbability) {
            throw new IllegalStateException(
                    "risk.thresholds.medium-risk-min-probability (%s) must be less than risk.thresholds.high-risk-min-probability (%s)"
                            .formatted(mediumRiskMinProbability, highRiskMinProbability)
            );
        }
    }
}
