package com.frauddetection.backend.dto.response;

import com.frauddetection.backend.enums.AccountStatus;
import com.frauddetection.backend.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "Result of a successful authentication.")
public record LoginResponse(

        @Schema(description = "Access token")
        String accessToken,

        @Schema(description = "Refresh token")
        String refreshToken,

        @Schema(description = "User ID")
        String userId,

        @Schema(description = "Full name")
        String fullName,

        @Schema(description = "Email address")
        String email,

        @Schema(description = "User role")
        UserRole role,

        @Schema(description = "Account status")
        AccountStatus accountStatus

) {
}