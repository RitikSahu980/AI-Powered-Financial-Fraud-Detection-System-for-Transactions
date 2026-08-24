package com.frauddetection.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Reset password after username/email verification.")
public record ResetPasswordRequest(

        String token,

        @NotBlank
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String newPassword
) {
}