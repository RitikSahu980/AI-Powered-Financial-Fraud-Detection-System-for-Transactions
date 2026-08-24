package com.frauddetection.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * Details submitted to register a new user account.
 *
 * <p>Role and account status are intentionally not part of this request -
 * they are assigned by the service layer (new self-registrations default
 * to a fixed role/status), not chosen by the caller, to avoid a
 * registration request granting itself elevated privileges.
 *
 * @param fullName the user's full display name
 * @param email    the email address to register and later log in with
 * @param password the plaintext password to hash and store
 */
@Builder
@Schema(description = "New user registration details.")
public record RegisterUserRequest(

        @Schema(description = "User's full display name.", example = "Jane Analyst",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank String fullName,
        @Schema(description = "Unique username.",
                example = "jane_analyst",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank
        @Size(min = 4, max = 20)
        String username,

        @Schema(description = "Email address to register and later log in with.",
                example = "analyst@frauddetection.com", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank @Email String email,

        @Schema(description = "Password to hash and store. Minimum 8 characters.",
                example = "SecurePassword123", minLength = 8, requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters long") String password
) {
}
