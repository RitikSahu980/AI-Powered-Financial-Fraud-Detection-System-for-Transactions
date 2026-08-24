package com.frauddetection.backend.exception;

/**
 * Thrown when a requested resource does not exist.
 *
 * <p>Handled by {@link GlobalExceptionHandler}, which maps this to
 * {@code 404 Not Found}. Services should throw this directly (e.g. from an
 * {@code Optional.orElseThrow}) rather than returning {@code Optional} for
 * lookups that the caller expects to resolve - this keeps controllers free
 * of conditional not-found handling, per this module's design rule.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Builds a consistently-worded not-found message.
     *
     * @param resourceType human-readable resource name, e.g. {@code "User"}, {@code "Alert"}
     * @param identifier   the identifier that could not be resolved
     */
    public static ResourceNotFoundException of(String resourceType, String identifier) {
        return new ResourceNotFoundException(resourceType + " not found: " + identifier);
    }
}
