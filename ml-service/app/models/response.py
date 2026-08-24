"""
Response schema for POST /predict.

Locked to exactly the fields the frozen contract assigns to this service:
prediction, fraud_probability, model_version. This is a deliberate
architectural boundary, not just a convention — confidence and risk_level
are derived/business values owned by Spring Boot (frozen contract, Part 7),
and this schema's field set is what prevents them from ever being added
here by accident in a future change. If a future requirement needs this
service to return something else, that is a contract change to make
explicitly, not a quiet addition to this file.
"""

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    """Prediction output for a single transaction, as returned by POST /predict."""

    prediction: int = Field(
        ...,
        description="Raw model output from pipeline.predict(): 0 = Not Fraudulent, 1 = Fraudulent.",
        examples=[0],
    )
    fraud_probability: float = Field(
        ...,
        description=(
            "Raw model output from pipeline.predict_proba()[:, 1], full precision, "
            "not rounded. Downstream derivation of confidence and risk_level is Spring "
            "Boot's responsibility, not this service's."
        ),
        examples=[0.00000005469514],
    )
    model_version: str = Field(
        ...,
        description="Identifies which saved pipeline artifact produced this prediction.",
        examples=["xgboost_v1"],
    )
    processing_ms: int = Field(
    ...,
    description="Time taken by the model to produce the prediction, in milliseconds.",
    examples=[24],
)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
    "prediction": 0,
    "fraud_probability": 0.00000005469514,
    "model_version": "xgboost_v1",
    "processing_ms": 24,
}
            ]
        }
    }


class ErrorResponse(BaseModel):
    """Standard error body returned for 4xx/5xx responses from this service."""

    error: str = Field(..., description="Short machine-readable error category.")
    detail: str = Field(..., description="Human-readable explanation, safe to log and to relay to callers.")


class HealthResponse(BaseModel):
    """Response body for GET /health."""

    status: str = Field(..., description="'ok' if the service is healthy and the model is loaded.", examples=["ok"])
    model_loaded: bool = Field(..., description="Whether the pipeline artifact is currently loaded in memory.")
    model_version: str = Field(..., description="Configured model_version label for this deployment.")
