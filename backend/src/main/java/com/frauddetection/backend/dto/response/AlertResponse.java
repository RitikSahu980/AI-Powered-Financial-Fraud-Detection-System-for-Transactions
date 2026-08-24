package com.frauddetection.backend.dto.response;

import com.frauddetection.backend.enums.AlertStatus;
import com.frauddetection.backend.enums.AlertType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;

/**
 * Fraud alert details returned to the frontend.
 *
 * @param alertId       unique identifier for this alert
 * @param transactionId identifier of the transaction this alert concerns
 * @param predictionId  identifier of the prediction that triggered this alert
 * @param alertType     why this alert was generated
 * @param alertStatus   current lifecycle status of this alert
 * @param createdAt     timestamp this alert was created
 * @param resolvedAt    timestamp this alert was resolved or dismissed; {@code null} while still open
 * @param notes         free-text analyst notes about this alert's investigation
 */
@Builder
@Schema(description = "Fraud alert details.")
public record AlertResponse(

        @Schema(description = "Unique identifier for this alert.", example = "ALT-001")
        String alertId,

        @Schema(description = "Identifier of the transaction this alert concerns.", example = "TXN-001")
        String transactionId,

        @Schema(description = "Identifier of the prediction that triggered this alert.", example = "PRED-001")
        String predictionId,

        @Schema(description = "Why this alert was generated.", example = "HIGH_RISK_TRANSACTION")
        AlertType alertType,

        @Schema(description = "Current lifecycle status of this alert.", example = "OPEN")
        AlertStatus alertStatus,

        @Schema(description = "Timestamp this alert was created.", example = "2026-07-20T10:15:30Z")
        Instant createdAt,

        @Schema(description = "Timestamp this alert was resolved or dismissed. Null while still open.",
                example = "2026-07-20T14:00:00Z", nullable = true)
        Instant resolvedAt,

        @Schema(description = "Free-text analyst notes about this alert's investigation.",
                example = "Confirmed with customer - unauthorized transfer.", nullable = true)
        String notes
) {
}
