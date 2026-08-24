package com.frauddetection.backend.exception;

import com.frauddetection.backend.dto.common.ErrorResponse;
import com.frauddetection.backend.dto.common.ValidationErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralized translation of exceptions into HTTP responses.
 *
 * <p>This is the single place in the application that maps a thrown
 * exception to an HTTP status and response body. Its existence is what
 * allows controllers to contain no try/catch blocks and services to simply
 * throw - see this module's design rule.
 *
 * <p><b>Two response body shapes, used consistently:</b>
 * <ul>
 *   <li><b>Single-message failures</b> ({@link ResourceNotFoundException},
 *       {@link DuplicateResourceException}, {@link BusinessException},
 *       field-less {@link ValidationException}, {@link MlServiceException},
 *       {@link HttpMessageNotReadableException}, {@link IllegalArgumentException},
 *       and any unhandled {@link Exception}) return a bare
 *       {@link ErrorResponse} body - {@code status}/{@code error}/{@code message}/
 *       {@code path}/{@code timestamp}, exactly as this module's own example
 *       specifies.</li>
 *   <li><b>Field-level validation failures</b> ({@link MethodArgumentNotValidException},
 *       {@link ConstraintViolationException}, and field-attributed
 *       {@link ValidationException}) return a bare {@code List<ValidationErrorResponse>}
 *       - a JSON array of {@code {field, rejectedValue, message}} objects.</li>
 * </ul>
 * <p><b>Deliberate deviation from this module's illustrative validation-error
 * JSON example</b> (which showed a {@code {status, error, validationErrors: [...]}}
 * wrapper): that exact shape does not correspond to any existing DTO -
 * {@code ErrorResponse} has no {@code validationErrors} field, and this
 * module's instructions explicitly forbid modifying existing DTOs or
 * introducing new ones. A bare list of {@code ValidationErrorResponse} is
 * the most faithful representation achievable using only the two DTOs this
 * module is scoped to reuse; per {@code ValidationErrorResponse}'s own
 * Javadoc (Module 3), this is exactly the composition it was designed to
 * support. If a combined status+list envelope is wanted, that requires a
 * new DTO added deliberately, not implied here.
 *
 * <p>Every handler logs the exception type, request path, and resulting
 * HTTP status. Nothing here logs request bodies, so passwords and
 * financial figures are never at risk of appearing in these logs - callers
 * (services) are responsible for not embedding sensitive values into
 * exception messages in the first place.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request
    ) {
        return respond(HttpStatus.NOT_FOUND, ex.getMessage(), request, ex);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request
    ) {
        return respond(HttpStatus.CONFLICT, ex.getMessage(), request, ex);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException ex, HttpServletRequest request
    ) {
        return respond(HttpStatus.BAD_REQUEST, ex.getMessage(), request, ex);
    }
    
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingRequestHeader(
            MissingRequestHeaderException ex,
            HttpServletRequest request) {

        ErrorResponse error = new ErrorResponse(
                400,
                "BAD_REQUEST",
                ex.getMessage(),
                request.getRequestURI(),
                Instant.now()
        );

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Handles {@link ValidationException}, branching on whether it carries
     * field-level attribution.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidationException(ValidationException ex, HttpServletRequest request) {
        logException(ex, request, HttpStatus.BAD_REQUEST);

        if (ex.hasFieldInfo()) {
            ValidationErrorResponse fieldError = ValidationErrorResponse.builder()
                    .field(ex.getField())
                    .rejectedValue(ex.getRejectedValue())
                    .message(ex.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(List.of(fieldError));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request));
    }

    /**
     * Handles failures communicating with the Python ML microservice.
     *
     * <p>{@code ex.getMessage()} is deliberately never returned to the
     * caller here - it may contain internal details (e.g. connection
     * error text, response bodies from the ML service). A fixed, generic
     * message is returned instead; the full exception, including
     * {@code ex.getReason()} and {@code ex.getHttpStatus()}, is logged
     * server-side for diagnosis.
     */
    @ExceptionHandler(MlServiceException.class)
    public ResponseEntity<ErrorResponse> handleMlServiceException(
            MlServiceException ex, HttpServletRequest request
    ) {
        log.error(
                "Exception handled: type={} path={} status=503 reason={} mlHttpStatus={}",
                ex.getClass().getSimpleName(), request.getRequestURI(), ex.getReason(), ex.getHttpStatus()
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(buildErrorResponse(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Fraud Detection Service is currently unavailable.",
                        request
                ));
    }

    /** Handles {@code @Valid} request body failures, reporting every rejected field. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<ValidationErrorResponse>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request
    ) {
        List<ValidationErrorResponse> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toValidationErrorResponse)
                .toList();

        log.warn(
                "Exception handled: type={} path={} status=400 fieldErrors={}",
                ex.getClass().getSimpleName(), request.getRequestURI(), errors.size()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    /** Handles constraint violations on method parameters (e.g. {@code @RequestParam} validation). */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<List<ValidationErrorResponse>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request
    ) {
        List<ValidationErrorResponse> errors = ex.getConstraintViolations().stream()
                .map(this::toValidationErrorResponse)
                .toList();

        log.warn(
                "Exception handled: type={} path={} status=400 violations={}",
                ex.getClass().getSimpleName(), request.getRequestURI(), errors.size()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    /** Handles malformed JSON request bodies (e.g. syntax errors, type mismatches during deserialization). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJson(
            HttpMessageNotReadableException ex, HttpServletRequest request
    ) {
        // ex.getMessage() for this exception type frequently includes raw
        // Jackson parser internals (class names, byte offsets) - not
        // returned to the caller, only logged.
        logException(ex, request, HttpStatus.BAD_REQUEST);
        return respond(HttpStatus.BAD_REQUEST, "Malformed JSON request body.", request, null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request
    ) {
        return respond(HttpStatus.BAD_REQUEST, ex.getMessage(), request, ex);
    }

    /**
     * Catch-all for any exception not handled above.
     *
     * <p>The full exception (including stack trace) is logged server-side;
     * callers receive only a fixed, generic message, never exception
     * details.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception ex, HttpServletRequest request) {
        log.error(
                "Exception handled: type={} path={} status=500 message={}",
                ex.getClass().getSimpleName(), request.getRequestURI(), ex.getMessage(), ex
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.", request));
    }

    // --- Shared helpers ------------------------------------------------

    private ResponseEntity<ErrorResponse> respond(
            HttpStatus status, String message, HttpServletRequest request, Exception ex
    ) {
        if (ex != null) {
            logException(ex, request, status);
        }
        return ResponseEntity.status(status).body(buildErrorResponse(status, message, request));
    }

    private ErrorResponse buildErrorResponse(HttpStatus status, String message, HttpServletRequest request) {
        return ErrorResponse.builder()
                .status(status.value())
                .error(status.name())
                .message(message)
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();
    }

    private void logException(Exception ex, HttpServletRequest request, HttpStatus status) {
        log.warn(
                "Exception handled: type={} path={} status={} message={}",
                ex.getClass().getSimpleName(), request.getRequestURI(), status.value(), ex.getMessage()
        );
    }

    private ValidationErrorResponse toValidationErrorResponse(FieldError fieldError) {
        return ValidationErrorResponse.builder()
                .field(fieldError.getField())
                .rejectedValue(fieldError.getRejectedValue())
                .message(fieldError.getDefaultMessage())
                .build();
    }

    private ValidationErrorResponse toValidationErrorResponse(ConstraintViolation<?> violation) {
        String propertyPath = violation.getPropertyPath().toString();
        // Constraint violations on method parameters report a dotted path
        // (e.g. "resolveAlert.notes") - only the final segment is the
        // actual field/parameter name relevant to the caller.
        String field = propertyPath.contains(".")
                ? propertyPath.substring(propertyPath.lastIndexOf('.') + 1)
                : propertyPath;

        return ValidationErrorResponse.builder()
                .field(field)
                .rejectedValue(violation.getInvalidValue())
                .message(violation.getMessage())
                .build();
    }
    
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex,
            HttpServletRequest request) {

        ErrorResponse error = ErrorResponse.builder()
                .status(401)
                .error("UNAUTHORIZED")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
