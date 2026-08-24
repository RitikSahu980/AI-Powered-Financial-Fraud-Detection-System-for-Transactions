"""
Request schema for POST /predict.

This is the enforcement point for the frozen ML input contract (Part 1a).
Field set, types, and validation rules below are deliberately locked to
match the contract exactly — do not add fields here to accommodate
frontend/metadata concerns (merchant, location, ip_address, device_info,
nameOrig, nameDest, etc.). Those fields, if the API gateway or Spring Boot
sends them, are the caller's business, not this service's — this service
sees only what the trained pipeline actually consumes plus the raw values
needed to compute the two engineered features.

nameOrig / nameDest are intentionally NOT part of this schema. Per the
frozen contract, they are stored by Spring Boot for identification/audit
purposes but are not model features, so the ML service has no reason to
accept or forward them.
"""

from enum import Enum

from pydantic import BaseModel, Field, model_validator


class TransactionType(str, Enum):
    """
    Transaction type categories the OneHotEncoder was fit on.

    Verified directly against the loaded pipeline's
    `OneHotEncoder.categories_` during Step 5a deployment verification:
    ['CASH_IN', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER'].

    Any other value is rejected at the API boundary with a 422, before it
    would reach the encoder's handle_unknown='ignore' behaviour. This is a
    deliberate choice: relying on handle_unknown='ignore' to silently
    zero-out an unrecognized category would let malformed requests through
    as artificially "safe-looking" predictions. Failing loudly here is
    safer for a fraud detection input path.
    """

    CASH_IN = "CASH_IN"
    CASH_OUT = "CASH_OUT"
    DEBIT = "DEBIT"
    PAYMENT = "PAYMENT"
    TRANSFER = "TRANSFER"


class TransactionRequest(BaseModel):
    """
    Raw transaction fields accepted by POST /predict.

    Matches the frozen contract's Part 1a exactly. The two engineered
    features (origBalanceDiff, destBalanceDiff) are deliberately NOT part
    of this schema — they are computed server-side in
    app/services/predictor.py from these raw fields, never accepted as
    caller-supplied input (a caller-supplied engineered feature could
    silently disagree with the raw fields and corrupt the prediction).
    """

    step: int = Field(
        ...,
        ge=1,
        description="Simulated time unit from the training data's time convention (1 step ~= 1 hour).",
        examples=[1],
    )
    type: TransactionType = Field(
        ...,
        description="Transaction type. Must be one of the categories the encoder was fit on.",
        examples=["TRANSFER"],
    )
    amount: float = Field(
        ...,
        gt=0,
        description="Transaction amount. Must be strictly positive.",
        examples=[181.00],
    )
    oldbalanceOrg: float = Field(
        ...,
        ge=0,
        description="Origin account balance immediately before this transaction.",
        examples=[181.00],
    )
    newbalanceOrig: float = Field(
        ...,
        ge=0,
        description="Origin account balance immediately after this transaction.",
        examples=[0.00],
    )
    oldbalanceDest: float = Field(
        ...,
        ge=0,
        description="Destination account balance immediately before this transaction.",
        examples=[0.00],
    )
    newbalanceDest: float = Field(
        ...,
        ge=0,
        description="Destination account balance immediately after this transaction.",
        examples=[0.00],
    )

    @model_validator(mode="after")
    def reject_non_finite_values(self) -> "TransactionRequest":
        """
        Defensive guard against NaN/Infinity slipping through as valid floats.

        Standard JSON does not support NaN/Infinity, but permissive parsers
        sometimes accept `NaN`/`Infinity` tokens. Since this pipeline has no
        imputer (confirmed in Step 3 of the frozen contract), any such value
        reaching the pipeline would silently corrupt the prediction rather
        than raise a clear error - so it is rejected explicitly, here, at
        the boundary.
        """
        for field_name in (
            "amount",
            "oldbalanceOrg",
            "newbalanceOrig",
            "oldbalanceDest",
            "newbalanceDest",
        ):
            value = getattr(self, field_name)
            if value != value or value in (float("inf"), float("-inf")):  # NaN check + inf check
                raise ValueError(f"{field_name} must be a finite number, got {value!r}")
        return self

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "step": 1,
                    "type": "TRANSFER",
                    "amount": 181.00,
                    "oldbalanceOrg": 181.00,
                    "newbalanceOrig": 0.00,
                    "oldbalanceDest": 0.00,
                    "newbalanceDest": 0.00,
                }
            ]
        }
    }
