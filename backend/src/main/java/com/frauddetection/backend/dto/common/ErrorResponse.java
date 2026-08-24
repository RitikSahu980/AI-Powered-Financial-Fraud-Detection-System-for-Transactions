package com.frauddetection.backend.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;

/**
 * Standard error response body for 4xx/5xx responses. Assembled by
 * {@code GlobalExceptionHandler} (Module 8).
 *
 * @param status    HTTP status code
 * @param error     short, machine-readable error category (e.g. {@code "NOT_FOUND"})
 * @param message   human-readable explanation, safe to display to the caller
 * @param path      the request path that produced this error
 * @param timestamp when this error occurred
 */
@Builder
@Schema(description = "Standard error response body.", example = """
        {
          "status": 404,
          "error": "NOT_FOUND",
          "message": "Prediction not found: PRED-001",
          "path": "/api/v1/predictions/PRED-001",
          "timestamp": "2026-07-20T10:15:30Z"
        }""")
public record ErrorResponse(

        @Schema(description = "HTTP status code.", example = "404")
        int status,

        @Schema(description = "Short, machine-readable error category.", example = "NOT_FOUND")
        String error,

        @Schema(description = "Human-readable explanation, safe to display to the caller.",
                example = "Prediction not found: PRED-001")
        String message,

        @Schema(description = "The request path that produced this error.",
                example = "/api/v1/predictions/PRED-001")
        String path,

        @Schema(description = "When this error occurred.", example = "2026-07-20T10:15:30Z")
        Instant timestamp
) {
}
