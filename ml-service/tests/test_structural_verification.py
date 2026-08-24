"""
Tests for PredictorService._verify_pipeline_structure (Step 5a logic).

These deliberately construct minimal sklearn objects rather than loading
the real model artifact, so this file's tests run in any environment with
scikit-learn installed, independent of whether xgboost is available - this
is what actually exercises each individual failure branch of the
verification logic, which the end-to-end tests in test_predict.py do not
(those only exercise the "everything is correct" path).
"""

import numpy as np
import pytest
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from app.core.exceptions import ModelLoadError
from app.services.predictor import PredictorService


def _build_valid_pipeline() -> Pipeline:
    """A minimal pipeline matching the expected structure, using
    LogisticRegression as a stand-in classifier (it exposes predict/predict_proba
    just like XGBClassifier does, so the structural checks - which never call
    predict itself - are exercised identically)."""
    preprocessor = ColumnTransformer(
        transformers=[("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), ["type"])],
        remainder="passthrough",
    )
    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", LogisticRegression())])

    X = _fake_training_frame()
    y = np.array([0, 1, 0, 1, 0])
    pipeline.fit(X, y)
    return pipeline


def _fake_training_frame():
    import pandas as pd

    return pd.DataFrame(
        {
            "step": [1, 2, 3, 4, 5],
            "type": ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"],
            "amount": [10.0, 20.0, 30.0, 40.0, 50.0],
            "oldbalanceOrg": [100.0, 200.0, 300.0, 400.0, 500.0],
            "newbalanceOrig": [90.0, 180.0, 270.0, 360.0, 450.0],
            "oldbalanceDest": [0.0, 0.0, 0.0, 0.0, 0.0],
            "newbalanceDest": [10.0, 20.0, 30.0, 40.0, 50.0],
            "origBalanceDiff": [0.0, 0.0, 0.0, 0.0, 0.0],
            "destBalanceDiff": [10.0, 20.0, 30.0, 40.0, 50.0],
        }
    )


def test_verify_pipeline_structure_accepts_valid_pipeline() -> None:
    service = PredictorService(model_path="unused", model_version="test")
    pipeline = _build_valid_pipeline()
    # Should not raise.
    service._verify_pipeline_structure(pipeline)


def test_verify_pipeline_structure_rejects_non_pipeline_object() -> None:
    service = PredictorService(model_path="unused", model_version="test")
    with pytest.raises(ModelLoadError, match="Expected a sklearn Pipeline"):
        service._verify_pipeline_structure(object())


def test_verify_pipeline_structure_rejects_wrong_step_names() -> None:
    service = PredictorService(model_path="unused", model_version="test")
    preprocessor = ColumnTransformer(
        transformers=[("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), ["type"])],
        remainder="passthrough",
    )
    bad_pipeline = Pipeline(steps=[("prep", preprocessor), ("model", LogisticRegression())])
    bad_pipeline.fit(_fake_training_frame(), np.array([0, 1, 0, 1, 0]))

    with pytest.raises(ModelLoadError, match="do not match the expected"):
        service._verify_pipeline_structure(bad_pipeline)


def test_verify_pipeline_structure_rejects_mismatched_categories() -> None:
    service = PredictorService(model_path="unused", model_version="test")
    preprocessor = ColumnTransformer(
        transformers=[("cat", OneHotEncoder(drop="first", handle_unknown="ignore"), ["type"])],
        remainder="passthrough",
    )
    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", LogisticRegression())])

    import pandas as pd

    df = _fake_training_frame()
    df["type"] = ["ONLY_ONE_CATEGORY"] * 5  # only one category seen at fit time
    pipeline.fit(df, np.array([0, 1, 0, 1, 0]))

    with pytest.raises(ModelLoadError, match="do not match expected"):
        service._verify_pipeline_structure(pipeline)
