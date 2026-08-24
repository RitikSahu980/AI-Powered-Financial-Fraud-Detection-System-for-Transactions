"""
Custom exception types for the ML service.

Kept deliberately small: this service has exactly two things that can go
wrong at runtime beyond standard request validation (which pydantic already
handles) — the model artifact failing to load, and a prediction call
failing against an already-loaded model. Giving these distinct exception
types lets the API layer translate them into clean, specific HTTP responses
instead of leaking raw stack traces to callers (Spring Boot).
"""


class ModelLoadError(RuntimeError):
    """
    Raised when the saved pipeline artifact cannot be loaded at startup.

    This is treated as a fatal, non-recoverable condition: the service
    should not start (or should report itself unhealthy) if the model
    cannot be loaded, since serving predictions without a model is not a
    degraded mode this service supports — there is no fallback prediction
    logic, by design (see frozen contract, Part 7: this service must never
    contain business logic beyond the model call itself).
    """


class PredictionError(RuntimeError):
    """
    Raised when the loaded pipeline fails during predict()/predict_proba()
    for a well-formed, already-validated request.

    This is distinct from a validation error (which pydantic catches before
    this exception type is ever reached) — it indicates the model itself
    raised during inference, e.g. an unexpected internal library error.
    """
