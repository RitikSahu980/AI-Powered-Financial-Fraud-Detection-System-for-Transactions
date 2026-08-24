package com.frauddetection.backend.dto.response;

import com.frauddetection.backend.enums.ActualOutcome;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;

/**
 * Stored feedback details returned to the frontend.
 *
 * @param feedbackId    unique identifier for this feedback record
 * @param predictionId  identifier of the prediction this feedback evaluates
 * @param actualOutcome the analyst's determination of what the transaction actually was
 * @param comments      free-text investigation notes accompanying the verdict
 * @param reviewedBy    identifier of the analyst who submitted this feedback
 * @param reviewedAt    timestamp this feedback was submitted
 */
@Builder
@Schema(description = "Stored analyst feedback for a reviewed prediction.")
public record FeedbackResponse(

        @Schema(description = "Unique identifier for this feedback record.", example = "FB-001")
        String feedbackId,

        @Schema(description = "Identifier of the prediction this feedback evaluates.", example = "PRED-001")
        String predictionId,

        @Schema(description = "The analyst's determination of what the transaction actually was.",
                example = "FRAUDULENT")
        ActualOutcome actualOutcome,

        @Schema(description = "Free-text investigation notes accompanying the verdict.",
                example = "Confirmed with customer - unauthorized transfer.", nullable = true)
        String comments,

        @Schema(description = "Identifier of the analyst who submitted this feedback.", example = "USR-002")
        String reviewedBy,

        @Schema(description = "Timestamp this feedback was submitted.", example = "2026-07-20T14:00:00Z")
        Instant reviewedAt
) {
}
