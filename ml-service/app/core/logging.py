"""
Logging configuration for the ML service.

Configured once at application startup (see app/main.py). Uses Python's
standard logging module with a consistent, greppable format rather than a
third-party logging framework, since this service is intentionally thin and
should not carry dependencies it doesn't need.

Logging policy for this service:
  - INFO:  request received (transaction_id if provided, NOT full payload),
           prediction result (prediction, fraud_probability, processing_ms).
  - DEBUG: full feature vector fed to the pipeline (only enabled in local
           development — never enable DEBUG in production, since it will
           log raw transaction amounts and account identifiers).
  - WARNING: recoverable issues, e.g. an unrecognized `type` category
             (handled gracefully by the encoder's handle_unknown='ignore',
             but still worth flagging since it means degraded input signal).
  - ERROR: prediction failures, model load failures.
"""

import logging
import sys

from app.config.settings import get_settings

_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_DATE_FORMAT = "%Y-%m-%dT%H:%M:%S%z"


def configure_logging() -> None:
    """
    Configure the root logger for the process.

    Idempotent: safe to call more than once (e.g. in tests) without
    duplicating handlers.
    """
    settings = get_settings()
    root_logger = logging.getLogger()

    # Avoid duplicate handlers if configure_logging() is called more than once
    # (e.g. once by the app, once by a test fixture).
    if root_logger.handlers:
        root_logger.handlers.clear()

    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=_LOG_FORMAT, datefmt=_DATE_FORMAT))

    root_logger.addHandler(handler)
    root_logger.setLevel(settings.log_level)

    # Quiet down noisy third-party loggers unless we're explicitly debugging.
    if settings.log_level != "DEBUG":
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a module-scoped logger. Call configure_logging() before this in app startup."""
    return logging.getLogger(name)
