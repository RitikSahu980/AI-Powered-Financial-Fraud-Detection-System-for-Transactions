from fastapi import APIRouter, Depends, HTTPException, status

from app.core.exceptions import PredictionError
from app.core.logging import get_logger
from app.models.request import TransactionRequest
from app.models.response import ErrorResponse, PredictionResponse
from app.services.predictor import PredictorService, get_predictor_service

logger = get_logger(__name__)

router = APIRouter(tags=["prediction"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict fraud probability for a single transaction",
    responses={
        422: {"model": ErrorResponse, "description": "Request failed validation."},
        500: {"model": ErrorResponse, "description": "Inference failed."},
    },
)
def predict_transaction(
    transaction: TransactionRequest,
    predictor: PredictorService = Depends(get_predictor_service),
) -> PredictionResponse:
    """
    Run fraud prediction for a single transaction.

    Request body matches the frozen ML input contract (Part 1a): the 7 raw
    transaction fields. The two engineered features (origBalanceDiff,
    destBalanceDiff) are computed server-side and are not part of the
    request body - see app/utils/feature_engineering.py.
    """
    logger.info(
        "Received prediction request: type=%s amount=%s step=%s",
        transaction.type.value,
        transaction.amount,
        transaction.step,
    )

    try:
        result = predictor.predict(transaction)
    except PredictionError as exc:
        logger.error("Prediction failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed. The model was unable to process this transaction.",
        ) from exc

    return result
