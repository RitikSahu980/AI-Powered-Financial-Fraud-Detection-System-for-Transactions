"""
Application entrypoint.

Responsibilities of this file, and only this file:
  - configure logging before anything else runs
  - load and structurally verify the model exactly once at startup
    (Step 5a), refusing to start the service if that fails
  - register routers
  - register global exception handlers so unexpected errors return a clean
    JSON body instead of a raw traceback to callers

This service intentionally contains no business logic itself - see
app/services/predictor.py and app/api/predict.py for that.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api import health, predict
from app.config.settings import get_settings
from app.core.exceptions import ModelLoadError
from app.core.logging import configure_logging, get_logger
from app.models.response import ErrorResponse
from app.services.predictor import init_predictor_service

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: load and structurally verify the model (Step 5a).

    If this raises, the application process fails to start entirely. This
    is deliberate: per the frozen contract, this service has no fallback
    prediction path, so serving traffic without a verified model is not a
    degraded mode it supports - it is simply not ready to run.
    """
    settings = get_settings()
    logger.info("Starting %s (model_version=%s)", settings.service_name, settings.model_version)

    try:
        init_predictor_service(
            model_path=settings.model_path,
            model_version=settings.model_version,
        )
    except ModelLoadError:
        logger.critical(
            "Model failed to load or failed structural verification. "
            "Service will not start. See preceding log lines for the specific check that failed."
        )
        raise

    logger.info("Startup complete. Service is ready to accept requests.")
    yield
    logger.info("Shutting down %s.", settings.service_name)


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.service_name,
        description=(
            "Thin fraud-detection prediction service. Wraps a saved sklearn "
            "Pipeline (ColumnTransformer + OneHotEncoder + XGBClassifier) "
            "and exposes predict()/predict_proba() over HTTP. Contains no "
            "business logic - confidence, risk thresholds, and alerting are "
            "owned by the Spring Boot backend, per the frozen technical contract."
        ),
        version=settings.model_version,
        lifespan=lifespan,
    )

    app.include_router(health.router)
    app.include_router(predict.router)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        """
        Translate pydantic validation errors into the service's standard
        ErrorResponse shape, rather than FastAPI's default raw error list,
        so callers (Spring Boot) get a consistent error contract across
        every failure mode this service can produce.
        """
        first_error = exc.errors()[0] if exc.errors() else {}
        field = ".".join(str(p) for p in first_error.get("loc", []) if p != "body")
        message = first_error.get("msg", "Invalid request.")
        detail = f"{field}: {message}" if field else message

        logger.warning("Request validation failed: %s", detail)
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=ErrorResponse(error="validation_error", detail=detail).model_dump(),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """
        Last-resort handler: any exception not already caught by a more
        specific handler is logged with full detail server-side, but the
        caller only ever receives a generic message - never a raw
        traceback, which could leak internal implementation details.
        """
        logger.exception("Unhandled exception while processing %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse(
                error="internal_error",
                detail="An unexpected error occurred while processing the request.",
            ).model_dump(),
        )

    return app


app = create_app()
