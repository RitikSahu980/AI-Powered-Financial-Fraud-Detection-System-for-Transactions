package com.frauddetection.backend.entity;

import com.frauddetection.backend.enums.ModelAlgorithm;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Real, evaluated performance metrics for a single trained model version. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "model_metrics")
public class ModelMetrics {

    @Id
    private String modelVersion;

    @NotNull
    private ModelAlgorithm algorithm;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double accuracy;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double precision;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double recall;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double f1Score;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private Double rocAuc;

    @NotNull
    private Instant trainedAt;

    @NotNull
    private Boolean isActive;
}
