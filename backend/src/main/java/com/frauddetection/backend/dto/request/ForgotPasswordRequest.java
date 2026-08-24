package com.frauddetection.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Verify username and email before resetting password.")
public record ForgotPasswordRequest(

        @NotBlank
        @Schema(example = "ritik123")
        String username,

        @NotBlank
        @Email
        @Schema(example = "ritik@gmail.com")
        String email
) {
}