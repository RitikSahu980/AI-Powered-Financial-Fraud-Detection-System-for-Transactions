"""
Centralized application configuration.

All environment-dependent values are read here, once, via pydantic-settings.
No other module in this service should call os.getenv() directly — importing
`settings` from this module is the single source of truth for configuration,
which keeps environment handling testable and prevents config drift between
local development, Docker, and CI.
"""

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings, populated from environment variables / .env file.

    Field names map to environment variables of the same name in upper case
    (e.g. `model_path` <- `MODEL_PATH`), which is pydantic-settings' default
    behaviour.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Service identity -------------------------------------------------
    service_name: str = Field(
        default="fraud-detection-ml-service",
        description="Human-readable service name, used in logs and health checks.",
    )
    model_version: str = Field(
        default="xgboost_v2",
        description=(
            "Version label returned in every prediction response. Identifies "
            "which saved pipeline artifact produced the prediction, for "
            "audit and Performance Dashboard purposes. This is NOT read from "
            "the pickle file itself — the pickle contains no version metadata "
            "of its own, so this must be set deliberately per deployment."
        ),
    )

    # --- Model artifact -----------------------------------------------------
    model_path: str = Field(
        default="online_payment_fraud_detection_model.pkl",
        description=(
            "Filesystem path to the saved joblib pipeline artifact "
            "(ColumnTransformer + OneHotEncoder + XGBClassifier)."
        ),
    )

    # --- Server ---------------------------------------------------------
    host: str = Field(default="0.0.0.0", description="Bind host for uvicorn.")
    port: int = Field(default=8000, description="Bind port for uvicorn.")

    # --- Logging ----------------------------------------------------------
    log_level: str = Field(default="INFO", description="Python logging level name.")

    @field_validator("model_path")
    @classmethod
    def model_path_must_be_non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("model_path must not be empty")
        return value

    @field_validator("log_level")
    @classmethod
    def log_level_must_be_valid(cls, value: str) -> str:
        valid = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper = value.upper()
        if upper not in valid:
            raise ValueError(f"log_level must be one of {sorted(valid)}, got {value!r}")
        return upper

    @property
    def model_path_resolved(self) -> Path:
        """Absolute path to the model artifact, resolved from the current working directory."""
        return Path(self.model_path).resolve()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return the process-wide Settings singleton.

    Cached so environment variables are parsed once per process, and so the
    same Settings instance can be depended on via FastAPI's dependency
    injection without re-parsing on every request.
    """
    return Settings()
