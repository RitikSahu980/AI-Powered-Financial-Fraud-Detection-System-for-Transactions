package com.frauddetection.backend.dto.response;

import com.frauddetection.backend.enums.PredictionLabel;
import com.frauddetection.backend.enums.RiskLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * The complete fraud prediction result returned to the frontend after a
 * transaction is analyzed.
 *
 * <p>Combines what the Python ML service returns directly with what this
 * Spring Boot backend derives on top of it: {@code prediction},
 * {@code fraudProbability}, {@code modelVersion}, and {@code processingMs}
 * come from the ML service unchanged; {@code predictionLabel},
 * {@code confidence}, {@code riskLevel}, and {@code alertCreated} are
 * derived by this backend.
 *
 * @param transactionId    identifier of the transaction this prediction concerns
 * @param prediction       raw model output: {@code 0} = Not Fraudulent, {@code 1} = Fraudulent
 * @param predictionLabel  human-readable mapping of {@code prediction}
 * @param fraudProbability raw fraud probability from the ML service, full precision, not rounded
 * @param confidence       confidence in the predicted class, derived by this backend
 * @param riskLevel        application-layer risk classification, derived by this backend
 * @param modelVersion     identifies which saved ML pipeline artifact produced this prediction
 * @param processingMs     time taken by the ML service to produce this prediction, in milliseconds
 * @param alertCreated     whether this prediction resulted in a new fraud alert being created
 */
@Builder
@Schema(description = "Complete fraud prediction result for a transaction.")
public record PredictionResponse(

        @Schema(description = "Identifier of the transaction this prediction concerns.", example = "TXN-001")
        String transactionId,

        @Schema(description = "Raw model output: 0 = Not Fraudulent, 1 = Fraudulent.", example = "1")
        Integer prediction,

        @Schema(description = "Human-readable mapping of 'prediction'.", example = "FRAUDULENT")
        PredictionLabel predictionLabel,

        @Schema(description = "Raw fraud probability from the ML service, full precision, not rounded.",
                example = "0.99993")
        Double fraudProbability,

        @Schema(description = "Confidence in the predicted class. fraudProbability if Fraudulent, "
                + "1 - fraudProbability if Not Fraudulent. Derived by this backend, never by the ML service.",
                example = "0.99993")
        Double confidence,

        @Schema(description = "Application-layer risk classification, derived by this backend from "
                + "fraudProbability against configured thresholds.", example = "HIGH")
        RiskLevel riskLevel,

        @Schema(description = "Identifies which saved ML pipeline artifact produced this prediction.",
                example = "xgboost_v1")
        String modelVersion,

        @Schema(description = "Time taken by the ML service to produce this prediction, in milliseconds.",
                example = "42")
        Long processingMs,

        @Schema(description = "Whether this prediction resulted in a new fraud alert being created.",
                example = "true")
        Boolean alertCreated
) {
}
