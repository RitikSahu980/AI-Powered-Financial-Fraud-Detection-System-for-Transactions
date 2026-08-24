package com.frauddetection.backend.dto.response;

import com.frauddetection.backend.enums.AccountStatus;
import com.frauddetection.backend.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;

@Builder
@Schema(description = "Safe, public-facing user account details.")
public record UserResponse(

        @Schema(description = "Unique identifier for this user.")
        String userId,

        @Schema(description = "Full name.")
        String fullName,

        @Schema(description = "Unique username.")
        String username,

        @Schema(description = "Email.")
        String email,

        @Schema(description = "Role.")
        UserRole role,

        @Schema(description = "Account status.")
        AccountStatus accountStatus,

        @Schema(description = "Current wallet balance.")
        BigDecimal walletBalance,

        @Schema(description = "Created timestamp.")
        Instant createdAt
) {
}