"""
Unit tests for app/utils/feature_engineering.py, isolated from the model
itself - these verify the arithmetic and column assembly, independent of
whether xgboost is installed for full pipeline inference.
"""

from app.models.request import TransactionRequest
from app.utils.feature_engineering import (
    MODEL_FEATURE_COLUMNS,
    build_model_input,
    compute_dest_balance_diff,
    compute_orig_balance_diff,
)


def test_compute_orig_balance_diff() -> None:
    # origBalanceDiff = oldbalanceOrg - amount - newbalanceOrig
    assert compute_orig_balance_diff(old_balance_org=181, amount=181, new_balance_orig=0) == 0
    assert compute_orig_balance_diff(old_balance_org=1000, amount=200, new_balance_orig=800) == 0
    assert compute_orig_balance_diff(old_balance_org=1000, amount=200, new_balance_orig=700) == 100


def test_compute_dest_balance_diff() -> None:
    # destBalanceDiff = oldbalanceDest + amount - newbalanceDest
    assert compute_dest_balance_diff(old_balance_dest=0, amount=181, new_balance_dest=0) == 181
    assert compute_dest_balance_diff(old_balance_dest=500, amount=100, new_balance_dest=600) == 0


def test_build_model_input_has_exact_verified_column_order() -> None:
    transaction = TransactionRequest(
        step=1,
        type="TRANSFER",
        amount=181,
        oldbalanceOrg=181,
        newbalanceOrig=0,
        oldbalanceDest=0,
        newbalanceDest=0,
    )
    df = build_model_input(transaction)

    assert list(df.columns) == MODEL_FEATURE_COLUMNS
    assert list(df.columns) == [
        "step",
        "type",
        "amount",
        "oldbalanceOrg",
        "newbalanceOrig",
        "oldbalanceDest",
        "newbalanceDest",
        "origBalanceDiff",
        "destBalanceDiff",
    ]
    assert len(df) == 1


def test_build_model_input_computes_engineered_features_correctly() -> None:
    transaction = TransactionRequest(
        step=5,
        type="CASH_OUT",
        amount=200,
        oldbalanceOrg=1000,
        newbalanceOrig=700,
        oldbalanceDest=500,
        newbalanceDest=600,
    )
    df = build_model_input(transaction)

    assert df.loc[0, "origBalanceDiff"] == 100  # 1000 - 200 - 700
    assert df.loc[0, "destBalanceDiff"] == 100  # 500 + 200 - 600


def test_build_model_input_type_is_raw_string_not_encoded() -> None:
    """
    The pipeline's internal OneHotEncoder must do the encoding - this
    function must pass the raw category string through unchanged.
    """
    transaction = TransactionRequest(
        step=1,
        type="PAYMENT",
        amount=50,
        oldbalanceOrg=50,
        newbalanceOrig=0,
        oldbalanceDest=0,
        newbalanceDest=0,
    )
    df = build_model_input(transaction)
    assert df.loc[0, "type"] == "PAYMENT"
