

import time

import joblib
import pandas as pd
from sklearn.pipeline import Pipeline

from app.core.exceptions import ModelLoadError, PredictionError
from app.core.logging import get_logger
from app.models.request import TransactionRequest, TransactionType
from app.models.response import PredictionResponse
from app.utils.feature_engineering import MODEL_FEATURE_COLUMNS, build_model_input

logger = get_logger(__name__)

EXPECTED_TYPE_CATEGORIES = {t.value for t in TransactionType}


class PredictorService:
    """
    Wraps the loaded fraud-detection pipeline.

    Instantiate once (via get_predictor_service dependency) and keep for the
    lifetime of the application process.
    """

    def __init__(self, model_path: str, model_version: str) -> None:
        self._model_path = model_path
        self._model_version = model_version
        self._pipeline: Pipeline | None = None

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    @property
    def model_version(self) -> str:
        return self._model_version

    def load(self) -> None:
        """
        Load the saved pipeline artifact from disk and run structural
        verification (Step 5a). Raises ModelLoadError on any failure -
        this is treated as fatal at startup (see app/main.py).
        """
        logger.info("Loading model artifact from %s", self._model_path)
        try:
            pipeline = joblib.load(self._model_path)
        except FileNotFoundError as exc:
            raise ModelLoadError(
                f"Model artifact not found at '{self._model_path}'. "
                "Confirm the file exists and MODEL_PATH is set correctly."
            ) from exc
        except Exception as exc:  # noqa: BLE001 - deliberately broad: any load failure is fatal
            raise ModelLoadError(f"Failed to load model artifact: {exc}") from exc

        self._verify_pipeline_structure(pipeline)
        self._pipeline = pipeline
        logger.info(
            "Model artifact loaded and verified successfully (model_version=%s)",
            self._model_version,
        )

    def _verify_pipeline_structure(self, pipeline: object) -> None:
        """
        Step 5a: structural verification of the loaded object.

        Verifies, in order:
          - object type is a sklearn Pipeline
          - it has 'preprocessor' and 'classifier' steps
          - the preprocessor is a ColumnTransformer containing a OneHotEncoder
            fit on the expected categories, applied to the 'type' column
          - the pipeline's expected input columns match MODEL_FEATURE_COLUMNS
            exactly, in order
          - the classifier exposes predict() and predict_proba()

        Raises ModelLoadError with a specific message on the first check
        that fails, so a broken deployment fails loudly and specifically
        rather than surfacing as a vague downstream 500 on first request.
        """
        if not isinstance(pipeline, Pipeline):
            raise ModelLoadError(
                f"Expected a sklearn Pipeline, got {type(pipeline).__name__}. "
                "The saved artifact does not match the frozen contract's expected structure."
            )

        step_names = list(pipeline.named_steps.keys())
        if "preprocessor" not in step_names or "classifier" not in step_names:
            raise ModelLoadError(
                f"Pipeline steps {step_names!r} do not match the expected "
                "['preprocessor', 'classifier'] structure."
            )

        preprocessor = pipeline.named_steps["preprocessor"]
        if not hasattr(preprocessor, "named_transformers_"):
            raise ModelLoadError(
                "Preprocessor step has no 'named_transformers_' - it does not appear "
                "to be a fitted ColumnTransformer."
            )

        if "cat" not in preprocessor.named_transformers_:
            raise ModelLoadError(
                "ColumnTransformer has no 'cat' transformer - expected a fitted "
                "OneHotEncoder on the 'type' column."
            )

        ohe = preprocessor.named_transformers_["cat"]
        if not hasattr(ohe, "categories_"):
            raise ModelLoadError("'cat' transformer is not a fitted OneHotEncoder (no categories_).")

        actual_categories = set(ohe.categories_[0].tolist())
        if actual_categories != EXPECTED_TYPE_CATEGORIES:
            raise ModelLoadError(
                f"OneHotEncoder categories {sorted(actual_categories)} do not match "
                f"expected {sorted(EXPECTED_TYPE_CATEGORIES)}. The API's TransactionType "
                "enum and the loaded model are out of sync - this must be fixed before "
                "serving traffic, or requests will be silently miscategorized."
            )

        expected_input_columns = getattr(preprocessor, "feature_names_in_", None)
        if expected_input_columns is None:
            raise ModelLoadError("Preprocessor has no feature_names_in_ - cannot verify expected input columns.")

        actual_columns = list(expected_input_columns)
        if actual_columns != MODEL_FEATURE_COLUMNS:
            raise ModelLoadError(
                f"Pipeline's expected input columns {actual_columns!r} do not match "
                f"this service's MODEL_FEATURE_COLUMNS {MODEL_FEATURE_COLUMNS!r}. "
                "Update app/utils/feature_engineering.py to match the artifact, or "
                "confirm the correct artifact is deployed."
            )

        classifier = pipeline.named_steps["classifier"]
        if not (hasattr(classifier, "predict") and hasattr(classifier, "predict_proba")):
            raise ModelLoadError("Classifier step does not expose predict()/predict_proba().")

        logger.info(
            "Structural verification passed: Pipeline(preprocessor=ColumnTransformer["
            "OneHotEncoder(categories=%s) on 'type'], classifier=%s), input_columns=%s",
            sorted(actual_categories),
            type(classifier).__name__,
            actual_columns,
        )

    def predict(self, transaction: TransactionRequest) -> PredictionResponse:
  
        if self._pipeline is None:
            raise PredictionError("Predictor service used before the model was loaded.")

        started_at = time.perf_counter()
        try:
            model_input: pd.DataFrame = build_model_input(transaction)
            prediction = int(self._pipeline.predict(model_input)[0])
            fraud_probability = float(self._pipeline.predict_proba(model_input)[:, 1][0])
        except Exception as exc:  # noqa: BLE001 - any inference failure is a PredictionError
            raise PredictionError(f"Inference failed: {exc}") from exc

        processing_ms = int((time.perf_counter() - started_at) * 1000)

        logger.info(
            "Prediction complete: prediction=%d fraud_probability=%.10e processing_ms=%d",
            prediction,
            fraud_probability,
            processing_ms,
        )

        return PredictionResponse(
    prediction=prediction,
    fraud_probability=fraud_probability,
    model_version=self._model_version,
    processing_ms=processing_ms,
)


_predictor_service: PredictorService | None = None


def init_predictor_service(model_path: str, model_version: str) -> PredictorService:
    """Create, load, and register the process-wide PredictorService. Call once at startup."""
    global _predictor_service
    service = PredictorService(model_path=model_path, model_version=model_version)
    service.load()
    _predictor_service = service
    return service


def get_predictor_service() -> PredictorService:
    """
    FastAPI dependency: returns the process-wide PredictorService.

    Raises RuntimeError if called before init_predictor_service() has run -
    this should be unreachable in normal operation since the lifespan
    handler runs before any request is accepted, but fails loudly rather
    than silently if it ever happens (e.g. in a misconfigured test).
    """
    if _predictor_service is None:
        raise RuntimeError(
            "PredictorService accessed before initialization. "
            "init_predictor_service() must run during application startup."
        )
    return _predictor_service
