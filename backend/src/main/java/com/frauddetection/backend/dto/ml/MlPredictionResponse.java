package com.frauddetection.backend.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

/** Exact response payload received from the Python ML microservice. Excludes confidence/riskLevel/alertCreated - those belong to Spring Boot. */
@Builder
public record MlPredictionResponse(
        Integer prediction,
        @JsonProperty("fraud_probability") Double fraudProbability,
        @JsonProperty("model_version") String modelVersion,
        @JsonProperty("processing_ms") Long processingMs
) {
}
