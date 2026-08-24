"""
One-time (per model version) capture of verified smoke-test transactions.

Run this script directly against the real loaded pipeline to generate
tests/fixtures/smoke_test_transactions.json - the permanent regression
fixture used by tests/test_predict.py.

WHY THIS SCRIPT EXISTS:
Reconstructed or remembered probability values (e.g. from a notebook cell
that wasn't re-run against a saved input) are not trustworthy as regression
assertions - we already hit this exact problem once (see the frozen
contract's correction note about the two reference probabilities whose
input rows were never preserved). This script closes that gap permanently:
every transaction below is defined FIRST, then run through the actual
loaded pipeline via the same code path the real service uses
(app.utils.feature_engineering.build_model_input), so the recorded
prediction/probability is guaranteed to be reproducible.

WHEN TO RE-RUN THIS SCRIPT:
Only when the model artifact itself changes (retrained, re-tuned, new
model_version). If MODEL_FEATURE_COLUMNS or the feature engineering
formulas ever change, re-run this too. Do NOT hand-edit the output JSON.

USAGE:
    cd ml-service
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    python scripts/capture_smoke_tests.py

This overwrites tests/fixtures/smoke_test_transactions.json. Review the
diff before committing - a diff here means the model's behavior changed,
which is exactly the kind of thing that should be visible and deliberate,
not silent.
"""

import json
import sys
import time
from pathlib import Path

# Allow running as `python scripts/capture_smoke_tests.py` from the
# ml-service/ directory without needing the package installed.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config.settings import get_settings  # noqa: E402
from app.models.request import TransactionRequest  # noqa: E402
from app.services.predictor import PredictorService  # noqa: E402

FIXTURE_PATH = Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "smoke_test_transactions.json"

# Candidate transactions chosen to cover a spread of realistic scenarios,
# not to target any particular prediction outcome. The actual
# prediction/fraud_probability for each is whatever the real pipeline
# produces - none of these values are asserted or assumed in advance.
CANDIDATE_TRANSACTIONS: list[dict] = [
    {
        "label": "known_transfer_full_drain",
        "description": (
            "The one transaction already confirmed by hand against the loaded "
            "pickle during Step 5a review: a TRANSFER that fully drains the "
            "origin balance to zero, with an empty destination account."
        ),
        "input": {
            "step": 1,
            "type": "TRANSFER",
            "amount": 181,
            "oldbalanceOrg": 181,
            "newbalanceOrig": 0,
            "oldbalanceDest": 0,
            "newbalanceDest": 0,
        },
    },
    {
        "label": "small_payment_balanced",
        "description": (
            "A small, ordinary PAYMENT where balances move in a way that is "
            "internally consistent (origBalanceDiff and destBalanceDiff both "
            "near zero) - a plausible everyday transaction."
        ),
        "input": {
            "step": 10,
            "type": "PAYMENT",
            "amount": 45.50,
            "oldbalanceOrg": 500.00,
            "newbalanceOrig": 454.50,
            "oldbalanceDest": 0,
            "newbalanceDest": 0,
        },
    },
    {
        "label": "cash_in_deposit",
        "description": "A CASH_IN deposit increasing the origin account balance.",
        "input": {
            "step": 25,
            "type": "CASH_IN",
            "amount": 1000.00,
            "oldbalanceOrg": 2000.00,
            "newbalanceOrig": 3000.00,
            "oldbalanceDest": 0,
            "newbalanceDest": 0,
        },
    },
    {
        "label": "cash_out_full_drain_large",
        "description": (
            "A large CASH_OUT that fully drains a large origin balance - "
            "the classic PaySim fraud signature pattern at higher amount."
        ),
        "input": {
            "step": 50,
            "type": "CASH_OUT",
            "amount": 181000.00,
            "oldbalanceOrg": 181000.00,
            "newbalanceOrig": 0,
            "oldbalanceDest": 0,
            "newbalanceDest": 181000.00,
        },
    },
    {
        "label": "debit_small_amount",
        "description": "A small DEBIT transaction, minimal balance movement.",
        "input": {
            "step": 5,
            "type": "DEBIT",
            "amount": 12.75,
            "oldbalanceOrg": 300.00,
            "newbalanceOrig": 287.25,
            "oldbalanceDest": 0,
            "newbalanceDest": 0,
        },
    },
    {
        "label": "transfer_inconsistent_balances",
        "description": (
            "A TRANSFER where the stated newbalanceOrig doesn't arithmetically "
            "match oldbalanceOrg - amount (origBalanceDiff far from zero) - "
            "tests a genuinely anomalous input pattern, not a hand-picked "
            "'should be fraud' example."
        ),
        "input": {
            "step": 100,
            "type": "TRANSFER",
            "amount": 5000.00,
            "oldbalanceOrg": 5000.00,
            "newbalanceOrig": 5000.00,  # balance didn't actually decrease
            "oldbalanceDest": 0,
            "newbalanceDest": 0,
        },
    },
    {
        "label": "minimum_valid_amount",
        "description": "Smallest plausible strictly-positive amount, boundary case.",
        "input": {
            "step": 1,
            "type": "PAYMENT",
            "amount": 0.01,
            "oldbalanceOrg": 100.00,
            "newbalanceOrig": 99.99,
            "oldbalanceDest": 0,
            "newbalanceDest": 0,
        },
    },
]


def main() -> None:
    settings = get_settings()
    service = PredictorService(model_path=settings.model_path, model_version=settings.model_version)

    print(f"Loading model from {settings.model_path} ...")
    service.load()  # runs full Step 5a structural verification; raises loudly on any mismatch
    print("Model loaded and structurally verified.\n")

    results = []
    for case in CANDIDATE_TRANSACTIONS:
        request = TransactionRequest(**case["input"])

        started = time.perf_counter()
        response = service.predict(request)
        elapsed_ms = (time.perf_counter() - started) * 1000

        result = {
            "label": case["label"],
            "description": case["description"],
            "input": case["input"],
            "expected_prediction": response.prediction,
            "expected_fraud_probability": response.fraud_probability,
        }
        results.append(result)

        print(
            f"[{case['label']}] prediction={response.prediction} "
            f"fraud_probability={response.fraud_probability:.10e} "
            f"({elapsed_ms:.1f} ms)"
        )

    FIXTURE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(FIXTURE_PATH, "w") as f:
        json.dump(
            {
                "model_version": settings.model_version,
                "generated_note": (
                    "Generated by scripts/capture_smoke_tests.py directly against the "
                    "loaded pipeline. Do not hand-edit. Re-run the script if the model "
                    "artifact changes."
                ),
                "cases": results,
            },
            f,
            indent=2,
        )

    print(f"\nWrote {len(results)} verified smoke-test transactions to {FIXTURE_PATH}")
    print("Review the diff, then commit this fixture - it is now the permanent regression suite.")


if __name__ == "__main__":
    main()
