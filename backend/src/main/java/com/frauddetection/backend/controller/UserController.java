package com.frauddetection.backend.controller;
import com.frauddetection.backend.dto.response.VerifyUserResponse;
import com.frauddetection.backend.dto.request.DeleteProfileRequest;
import com.frauddetection.backend.dto.request.ResetPasswordRequest;
import com.frauddetection.backend.dto.request.ForgotPasswordRequest;
import com.frauddetection.backend.dto.common.ApiResponse;
import com.frauddetection.backend.dto.common.ErrorResponse;
import com.frauddetection.backend.dto.common.ValidationErrorResponse;
import com.frauddetection.backend.dto.request.LoginRequest;
import com.frauddetection.backend.dto.request.RegisterUserRequest;
import com.frauddetection.backend.dto.response.LoginResponse;
import com.frauddetection.backend.dto.response.UserResponse;
import com.frauddetection.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.frauddetection.backend.dto.request.ChangePasswordRequest;


@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "User registration and account lookup. "
        + "Authentication is not yet implemented - these endpoints are currently unauthenticated.")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        userService.login(request)
                )
        );
    }
    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<String>> deleteProfile(

            @RequestHeader("X-User-Id") String userId,

            @Valid
            @RequestBody DeleteProfileRequest request

    ) {

        userService.deleteProfile(
                userId,
                request.password()
        );

        return ResponseEntity.ok(
                ApiResponse.success("Profile deleted successfully.")
        );
    }
    @PutMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(

            @Valid
            @RequestBody ResetPasswordRequest request

    ) {

        userService.resetPassword(

                request.token(),
                request.newPassword()

        );

        return ResponseEntity.ok(
                ApiResponse.success("Password reset successfully.")
        );
    }
    @PostMapping("/verify-user")
    public ResponseEntity<ApiResponse<VerifyUserResponse>> verifyUser(
            @Valid @RequestBody ForgotPasswordRequest request) {

        VerifyUserResponse response = userService.verifyUser(
                request.username(),
                request.email()
        );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }


    @PostMapping("/register")
    @Operation(
            summary = "Register a new user account",
            description = "Creates a new user account. Role defaults to ANALYST and account status to ACTIVE - "
                    + "neither can be chosen by the caller, so a registration request can never grant itself "
                    + "elevated privileges."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "User registered successfully.",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Request failed validation.",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ValidationErrorResponse.class)))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "409", description = "An account already exists with this email address or username.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Registration details.", required = true,
                    content = @Content(examples = @ExampleObject(value = """
        {
          "fullName": "Jane Analyst",
          "username": "jane_analyst",
          "email": "analyst@frauddetection.com",
          "password": "SecurePassword123"
        }""")))
            @Valid @RequestBody RegisterUserRequest request
    ) {
        log.info("POST /api/v1/users/register invoked");

        UserResponse response = userService.registerUser(request);

        log.info("Request completed: POST /api/v1/users/register status=201 userId={}", response.userId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully.", response));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get a user by identifier", description = "Finds a user account by its unique identifier.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "User found.",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No user exists with the given identifier.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Schema(description = "The user's identifier.", example = "USR-001") @PathVariable String userId
    ) {
        log.info("GET /api/v1/users/{} invoked", userId);

        UserResponse response = userService.getUserById(userId);

        log.info("Request completed: GET /api/v1/users/{} status=200", userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get a user by email address", description = "Finds a user account by its login email address.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "User found.",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No user exists with the given email address.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(
            @Schema(description = "The email address to search for.", example = "analyst@frauddetection.com")
            @PathVariable String email
    ) {
        log.info("GET /api/v1/users/email/{} invoked", email);

        UserResponse response = userService.getUserByEmail(email);

        log.info("Request completed: GET /api/v1/users/email/{} status=200", email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(

            @RequestHeader("X-User-Id") String userId,

            @Valid
            @RequestBody ChangePasswordRequest request

    ) {

        userService.changePassword(

                userId,
                request.currentPassword(),
                request.newPassword()

        );

        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully.")
        );
    }
}
