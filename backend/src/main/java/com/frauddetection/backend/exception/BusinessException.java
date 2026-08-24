package com.frauddetection.backend.exception;

/**
 * Thrown when a request is well-formed and references resources that
 * exist, but violates a business rule - e.g. attempting to resolve an
 * alert that is already resolved, or submitting feedback in a state that
 * doesn't permit it.
 *
 * <p>Handled by {@link GlobalExceptionHandler}, which maps this to
 * {@code 400 Bad Request}. Distinct from {@link ValidationException}:
 * this is for rule violations that depend on existing state (an alert's
 * current status), not for malformed input in isolation.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
