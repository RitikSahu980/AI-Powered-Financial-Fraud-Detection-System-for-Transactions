package com.frauddetection.backend.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * A single field-level validation failure. Requests that fail validation
 * return a JSON array of these (see {@code GlobalExceptionHandler},
 * Module 8), not a single object.
 *
 * @param field         the name of the field that failed validation
 * @param rejectedValue the value that was rejected; may be {@code null} if the field itself was missing
 * @param message       human-readable explanation of why the value was rejected
 */
@Builder
@Schema(description = "A single field-level validation failure. Endpoints return a JSON array of these "
        + "when a request fails validation.", example = """
        {
          "field": "amount",
          "rejectedValue": -10,
          "message": "Amount must be greater than zero."
        }""")
public record ValidationErrorResponse(

        @Schema(description = "The name of the field that failed validation.", example = "amount")
        String field,

        @Schema(description = "The value that was rejected. May be null if the field itself was missing.",
                example = "-10", nullable = true)
        Object rejectedValue,

        @Schema(description = "Human-readable explanation of why the value was rejected.",
                example = "Amount must be greater than zero.")
        String message
) {
}
