package com.frauddetection.backend.dto.request;

import com.frauddetection.backend.enums.TransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import lombok.Builder;

@Builder
@Schema(description = "A transaction to submit for storage and fraud prediction.")
public record CreateTransactionRequest(

        @Schema(description = "Simulated time unit (1 step ~= 1 hour).", example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @Min(1) Integer step,

        @Schema(description = "Transaction type. Must be a category the ML model's encoder was fit on.",
                example = "TRANSFER", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull TransactionType type,
        
        @Schema(
                description = "Payment method used for the transaction.",
                example = "UPI",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank
        String paymentMethod,
        
        @Schema(description = "Razorpay Order ID", example = "order_Q9jY2x123456")
        String razorpayOrderId,

        @Schema(description = "Razorpay Payment ID", example = "pay_Q9jZ8abc12345")
        String razorpayPaymentId,

        @Schema(description = "Transaction amount. Must be strictly positive.", example = "181.00",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @Positive BigDecimal amount,

        @Schema(description = "Identifier of the originating account. Application metadata only - not an ML feature.",
                example = "C123456789", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank String nameOrig,

        @Schema(description = "Origin account balance immediately before this transaction.", example = "181.00",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @PositiveOrZero BigDecimal oldbalanceOrg,

        @Schema(description = "Origin account balance immediately after this transaction.", example = "0.00",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @PositiveOrZero BigDecimal newbalanceOrig,

        @Schema(description = "Identifier of the destination account. Application metadata only - not an ML feature.",
                example = "C987654321", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank String nameDest,

        @Schema(description = "Destination account balance immediately before this transaction.", example = "0.00",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @PositiveOrZero BigDecimal oldbalanceDest,

        @Schema(description = "Destination account balance immediately after this transaction.", example = "0.00",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull @PositiveOrZero BigDecimal newbalanceDest
) {
}
