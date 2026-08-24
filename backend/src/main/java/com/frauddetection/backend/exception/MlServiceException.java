package com.frauddetection.backend.exception;

/** Thrown for any failure communicating with the Python ML microservice. Unchecked. */
public class MlServiceException extends RuntimeException {

    public enum Reason {
        CONNECTION_FAILURE,
        TIMEOUT,
        CLIENT_ERROR,
        SERVER_ERROR,
        INVALID_RESPONSE
    }

    private final Reason reason;
    private final Integer httpStatus;

    private MlServiceException(String message, Throwable cause, Reason reason, Integer httpStatus) {
        super(message, cause);
        this.reason = reason;
        this.httpStatus = httpStatus;
    }

    public static MlServiceException connectionFailure(Throwable cause) {
        return new MlServiceException(
                "Failed to connect to the ML service: " + cause.getMessage(),
                cause, Reason.CONNECTION_FAILURE, null
        );
    }

    public static MlServiceException timeout(Throwable cause) {
        return new MlServiceException("ML service request timed out.", cause, Reason.TIMEOUT, null);
    }

    public static MlServiceException clientError(int status, String responseBody) {
        return new MlServiceException(
                "ML service rejected the request with HTTP " + status + ": " + safeBody(responseBody),
                null, Reason.CLIENT_ERROR, status
        );
    }

    public static MlServiceException serverError(int status, String responseBody) {
        return new MlServiceException(
                "ML service failed with HTTP " + status + ": " + safeBody(responseBody),
                null, Reason.SERVER_ERROR, status
        );
    }

    public static MlServiceException invalidResponse(Throwable cause) {
        return new MlServiceException(
                "ML service returned a response that could not be understood: " + cause.getMessage(),
                cause, Reason.INVALID_RESPONSE, null
        );
    }

    private static String safeBody(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "(empty response body)";
        }
        return responseBody.length() > 500 ? responseBody.substring(0, 500) + "...(truncated)" : responseBody;
    }

    public Reason getReason() {
        return reason;
    }

    public Integer getHttpStatus() {
        return httpStatus;
    }
}
