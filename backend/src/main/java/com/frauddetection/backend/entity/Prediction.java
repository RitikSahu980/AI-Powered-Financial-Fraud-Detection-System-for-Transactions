package com.frauddetection.backend.entity;

import com.frauddetection.backend.enums.PredictionLabel;
import com.frauddetection.backend.enums.RiskLevel;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * The fraud prediction result for a single Transaction. fraudProbability/modelVersion/processingMs
 * come directly from the ML service; confidence/riskLevel are derived by this backend, never by Python.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "predictions")
public class Prediction {

    @Id
    private String predictionId;

    @NotBlank
    @Indexed
    private String transactionId;

    @NotNull
    private PredictionLabel prediction;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double fraudProbability;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double confidence;

    @NotNull
    private RiskLevel riskLevel;

    @NotBlank
    private String modelVersion;

    @NotNull
    @PositiveOrZero
    private Long processingMs;

    @NotNull
    private Instant predictedAt;
}
