package com.frauddetection.backend.dto.request;

import com.frauddetection.backend.enums.ActualOutcome;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * An analyst's verdict submitted for a reviewed prediction.
 *
 * @param predictionId  identifier of the {@code Prediction} this feedback evaluates
 * @param actualOutcome the analyst's determination of what the transaction actually was
 * @param comments      optional free-text investigation notes
 */
@Builder
@Schema(description = "An analyst's verdict on a reviewed prediction.")
public record FeedbackRequest(

        @Schema(description = "Identifier of the prediction this feedback evaluates.", example = "PRED-001",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank String predictionId,

        @Schema(description = "The analyst's determination of what the transaction actually was.",
                example = "FRAUDULENT", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull ActualOutcome actualOutcome,

        @Schema(description = "Optional free-text investigation notes.",
                example = "Confirmed with customer - unauthorized transfer.", maxLength = 2000)
        @Size(max = 2000, message = "Comments must not exceed 2000 characters") String comments
) {
}
