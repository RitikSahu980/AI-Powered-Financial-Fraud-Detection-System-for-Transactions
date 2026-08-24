"""
Feature engineering for the fraud detection pipeline.

This module is the single place in the codebase that:
  1. Computes the two engineered features the trained pipeline expects
     (origBalanceDiff, destBalanceDiff), and
  2. Assembles the model input as a pandas DataFrame with the exact column
     order the saved pipeline's `feature_names_in_` expects.

That column order was verified directly against the loaded pickle during
Step 5a deployment verification:

    ['step', 'type', 'amount', 'oldbalanceOrg', 'newbalanceOrig',
     'oldbalanceDest', 'newbalanceDest', 'origBalanceDiff', 'destBalanceDiff']

Keeping this in one function (rather than inline in the predictor service)
means there is exactly one place that encodes the frozen contract's Part 1b
and 1c, and exactly one place to unit-test it against.

IMPORTANT: this module must never scale, encode, or otherwise transform any
of these values beyond the two arithmetic formulas below. All encoding is
handled internally by the loaded pipeline's ColumnTransformer /
OneHotEncoder — duplicating any of that here would silently double-process
the input and corrupt predictions.
"""

import pandas as pd

from app.models.request import TransactionRequest

# Exact column order the saved pipeline expects. Sourced from
# `pipeline.feature_names_in_`, verified during Step 5a. Defined as a
# module-level constant (not recomputed per-request) so any future drift
# between this list and the actual pipeline is a single-line diff to review,
# and so it can be asserted against the loaded pipeline at startup
# (see app/services/predictor.py `_verify_pipeline_structure`).
MODEL_FEATURE_COLUMNS: list[str] = [
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


def compute_orig_balance_diff(old_balance_org: float, amount: float, new_balance_orig: float) -> float:
    """
    origBalanceDiff = oldbalanceOrg - amount - newbalanceOrig

    Formula confirmed against the training notebook (frozen contract, Part 1b).
    """
    return old_balance_org - amount - new_balance_orig


def compute_dest_balance_diff(old_balance_dest: float, amount: float, new_balance_dest: float) -> float:
    """
    destBalanceDiff = oldbalanceDest + amount - newbalanceDest

    Formula confirmed against the training notebook (frozen contract, Part 1b).
    """
    return old_balance_dest + amount - new_balance_dest


def build_model_input(transaction: TransactionRequest) -> pd.DataFrame:
    """
    Build the exact single-row DataFrame the pipeline expects for prediction.

    Args:
        transaction: validated raw transaction fields.

    Returns:
        A single-row pandas DataFrame with columns in MODEL_FEATURE_COLUMNS
        order. `type` is passed as its raw string value — the pipeline's
        internal OneHotEncoder performs the encoding; this function must
        never one-hot encode it manually.
    """
    orig_balance_diff = compute_orig_balance_diff(
        old_balance_org=transaction.oldbalanceOrg,
        amount=transaction.amount,
        new_balance_orig=transaction.newbalanceOrig,
    )
    dest_balance_diff = compute_dest_balance_diff(
        old_balance_dest=transaction.oldbalanceDest,
        amount=transaction.amount,
        new_balance_dest=transaction.newbalanceDest,
    )

    row = {
        "step": transaction.step,
        "type": transaction.type.value,
        "amount": transaction.amount,
        "oldbalanceOrg": transaction.oldbalanceOrg,
        "newbalanceOrig": transaction.newbalanceOrig,
        "oldbalanceDest": transaction.oldbalanceDest,
        "newbalanceDest": transaction.newbalanceDest,
        "origBalanceDiff": orig_balance_diff,
        "destBalanceDiff": dest_balance_diff,
    }

    # Build via a list-of-one-dict rather than a dict-of-scalars to guarantee
    # a proper single-row DataFrame (a dict-of-scalars raises on construction
    # since pandas can't infer an index from scalar values).
    df = pd.DataFrame([row], columns=MODEL_FEATURE_COLUMNS)
    return df
