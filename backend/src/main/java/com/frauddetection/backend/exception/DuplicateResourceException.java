package com.frauddetection.backend.exception;

/**
 * Thrown when an operation would create a resource that conflicts with one
 * that already exists (e.g. registering an email address already in use).
 *
 * <p>Handled by {@link GlobalExceptionHandler}, which maps this to
 * {@code 409 Conflict}.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    /**
     * Builds a consistently-worded conflict message.
     *
     * @param resourceType   human-readable resource name, e.g. {@code "User"}
     * @param conflictField  the field that must be unique, e.g. {@code "email"}
     * @param conflictValue  the value that already exists
     */
    public static DuplicateResourceException of(String resourceType, String conflictField, String conflictValue) {
        return new DuplicateResourceException(
                resourceType + " with " + conflictField + " '" + conflictValue + "' already exists.");
    }
}
