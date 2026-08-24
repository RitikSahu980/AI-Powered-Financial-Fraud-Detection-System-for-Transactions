package com.frauddetection.backend.exception;

/**
 * Thrown for application-level validation failures that Jakarta Bean
 * Validation cannot express - e.g. rules that depend on more than one
 * field's relationship, or lookups against persisted state performed
 * during validation-like checks in the service layer.
 *
 * <p>Handled by {@link GlobalExceptionHandler}, which maps this to
 * {@code 400 Bad Request}. Optionally carries the specific field and
 * rejected value that failed, mirroring {@code ValidationErrorResponse}'s
 * shape (dto.common) - when present, the handler reports it with the same
 * field-level structure used for {@code MethodArgumentNotValidException};
 * when absent, the handler falls back to a plain message-only error body.
 */
public class ValidationException extends RuntimeException {

    private final String field;
    private final Object rejectedValue;

    /** Message-only validation failure, with no specific field to attribute it to. */
    public ValidationException(String message) {
        this(null, null, message);
    }

    /**
     * Field-level validation failure.
     *
     * @param field         the name of the field that failed validation
     * @param rejectedValue the value that was rejected
     * @param message       human-readable explanation of why the value was rejected
     */
    public ValidationException(String field, Object rejectedValue, String message) {
        super(message);
        this.field = field;
        this.rejectedValue = rejectedValue;
    }

    public String getField() {
        return field;
    }

    public Object getRejectedValue() {
        return rejectedValue;
    }

    /** Whether this exception carries field-level attribution, as opposed to a plain message. */
    public boolean hasFieldInfo() {
        return field != null;
    }
}
