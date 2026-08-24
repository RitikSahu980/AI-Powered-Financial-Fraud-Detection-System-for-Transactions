"""Tests for GET /health."""

from fastapi.testclient import TestClient


def test_health_returns_ok_when_model_loaded(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True
    assert isinstance(body["model_version"], str) and body["model_version"]
