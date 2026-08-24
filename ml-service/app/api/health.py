"""
Health check endpoint.

Distinguishes "process is running" from "model is loaded and ready to
serve predictions" - a process can be up while the model failed to load
(though per app/main.py's startup policy, this service refuses to start at
all if the model fails to load, so in practice model_loaded should always
be True whenever this endpoint is reachable at all). Reported explicitly
anyway, since it is the honest thing for a health check to state rather
than assume, and it gives Docker/orchestration/Spring Boot a stable
contract to depend on.
"""

from fastapi import APIRouter, Depends

from app.config.settings import Settings, get_settings
from app.models.response import HealthResponse
from app.services.predictor import PredictorService, get_predictor_service

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Service health check")
def health_check(
    predictor: PredictorService = Depends(get_predictor_service),
    settings: Settings = Depends(get_settings),
) -> HealthResponse:
    """
    Returns 200 with status='ok' if the model is loaded and the service is
    ready to serve predictions.

    Intended for use as a Docker HEALTHCHECK / orchestration readiness probe.
    """
    return HealthResponse(
        status="ok" if predictor.is_loaded else "degraded",
        model_loaded=predictor.is_loaded,
        model_version=settings.model_version,
    )
