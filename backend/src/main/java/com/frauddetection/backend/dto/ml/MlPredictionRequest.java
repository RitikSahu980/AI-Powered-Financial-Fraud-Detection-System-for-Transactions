package com.frauddetection.backend.dto.ml;

import com.frauddetection.backend.enums.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import lombok.Builder;

/** Exact request payload sent to the Python ML microservice's POST /predict endpoint. Excludes transactionId/userId/nameOrig/nameDest. */
@Builder
public record MlPredictionRequest(
        @NotNull @Min(1) Integer step,
        @NotNull TransactionType type,
        @NotNull @Positive BigDecimal amount,
        @NotNull @PositiveOrZero BigDecimal oldbalanceOrg,
        @NotNull @PositiveOrZero BigDecimal newbalanceOrig,
        @NotNull @PositiveOrZero BigDecimal oldbalanceDest,
        @NotNull @PositiveOrZero BigDecimal newbalanceDest
) {
}
