package com.frauddetection.backend.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;

/**
 * Generic response envelope wrapping every successful API response body in
 * a consistent shape.
 *
 * @param success   whether the request was handled successfully
 * @param message   a short, human-readable summary of the result
 * @param timestamp when this response was produced
 * @param data      the actual response payload
 * @param <T> the type of the wrapped payload
 */
@Builder
@Schema(description = "Generic response envelope wrapping every successful API response.")
public record ApiResponse<T>(

        @Schema(description = "Whether the request was handled successfully.", example = "true")
        boolean success,

        @Schema(description = "Short, human-readable summary of the result.",
                example = "Transaction processed successfully.")
        String message,

        @Schema(description = "When this response was produced.", example = "2026-07-20T10:15:30Z")
        Instant timestamp,

        @Schema(description = "The actual response payload.")
        T data
) {

    public static <T> ApiResponse<T> success(T data) {
        return success("Request completed successfully.", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .timestamp(Instant.now())
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now())
                .data(null)
                .build();
    }
}
