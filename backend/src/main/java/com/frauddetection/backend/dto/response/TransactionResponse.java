package com.frauddetection.backend.dto.response;

import com.frauddetection.backend.enums.TransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;

@Builder
@Schema(description = "Stored transaction details.")
public record TransactionResponse(

        @Schema(description = "Unique identifier for this transaction.", example = "TXN-001")
        String transactionId,

        @Schema(description = "Identifier of the user who submitted or simulated this transaction.", example = "USR-001")
        String userId,

        @Schema(description = "Simulated time unit (1 step ~= 1 hour).", example = "1")
        Integer step,

        @Schema(description = "Transaction type.", example = "TRANSFER")
        TransactionType type,
        
        @Schema(description = "Payment method used.", example = "UPI")
        String paymentMethod,
        
        @Schema(description = "Razorpay Order ID", example = "order_Q9jY2x123456")
        String razorpayOrderId,

        @Schema(description = "Razorpay Payment ID", example = "pay_Q9jZ8abc12345")
        String razorpayPaymentId,

        @Schema(description = "Transaction amount.", example = "181.00")
        BigDecimal amount,

        @Schema(description = "Identifier of the originating account.", example = "C123456789")
        String nameOrig,

        @Schema(description = "Origin account balance immediately before this transaction.", example = "181.00")
        BigDecimal oldbalanceOrg,

        @Schema(description = "Origin account balance immediately after this transaction.", example = "0.00")
        BigDecimal newbalanceOrig,

        @Schema(description = "Identifier of the destination account.", example = "C987654321")
        String nameDest,

        @Schema(description = "Destination account balance immediately before this transaction.", example = "0.00")
        BigDecimal oldbalanceDest,

        @Schema(description = "Destination account balance immediately after this transaction.", example = "0.00")
        BigDecimal newbalanceDest,

        @Schema(description = "Timestamp this transaction was persisted.", example = "2026-07-20T10:15:30Z")
        Instant createdAt
) {
}
