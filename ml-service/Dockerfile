# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base

# Prevents Python from writing .pyc files and buffering stdout/stderr,
# which keeps container logs flowing immediately (important for the
# structured startup logs from app/core/logging.py to appear promptly).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv/app

# Install OS-level build dependencies needed by xgboost's compiled
# extensions, then remove them in the same layer to keep the final image
# lean. libgomp1 is kept (not removed) since xgboost needs it at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and the model artifact separately from
# requirements.txt above, so Docker's layer cache is only invalidated by a
# dependency change, not by every application code change.
COPY app ./app
COPY online_payment_fraud_detection_model.pkl .

# Do not copy tests/ or .env into the production image - tests are a
# development-time concern and .env should be supplied at runtime via
# docker-compose / the orchestrator's own secret/env management, never
# baked into the image.

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

# Single worker by default: the model is loaded once per process, and this
# service is CPU-bound during inference, so horizontal scaling should be
# done via multiple container replicas (each with its own loaded model),
# not multiple uvicorn workers sharing one container's memory budget.
# Override via the WEB_CONCURRENCY env var or a different CMD if the
# deployment target needs multiple workers per container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
