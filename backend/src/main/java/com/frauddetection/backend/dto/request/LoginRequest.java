package com.frauddetection.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Credentials submitted to authenticate a user.
 *
 * @param email    the account's login email address
 * @param password the account's plaintext password, as submitted by the
 *                 client; verified against the stored hash by the service
 *                 layer and never itself persisted
 */
@Builder
@Schema(description = "Login credentials.")
public record LoginRequest(

        @Schema(description = "Registered account email address.", example = "analyst@frauddetection.com",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank @Email String email,

        @Schema(description = "Account password.", example = "SecurePassword123",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank String password
) {
}
