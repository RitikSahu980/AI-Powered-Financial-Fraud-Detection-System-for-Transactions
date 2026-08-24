"""
Shared pytest fixtures.

These fixtures exercise the real application against the actual saved model
artifact (online_payment_fraud_detection_model.pkl), not a mock - this is
deliberate. The most valuable thing this test suite can verify is that the
running service produces the same numbers the training notebook did, which
a mocked model could never catch. Running these tests requires xgboost to
be installed (see requirements.txt) since the real classifier is needed to
unpickle and run the pipeline.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """
    A TestClient wired against the real app, including its lifespan
    handler - this means the real model artifact is loaded and
    structurally verified once per test session, exactly as it would be
    in production.
    """
    with TestClient(app) as test_client:
        yield test_client
