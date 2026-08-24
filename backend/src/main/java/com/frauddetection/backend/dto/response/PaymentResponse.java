package com.frauddetection.backend.dto.response;

import com.frauddetection.backend.enums.RiskLevel;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record PaymentResponse(

        String transactionId,

        String paymentStatus,

        String predictionLabel,

        RiskLevel riskLevel,

        double fraudProbability,

        double confidence,

        BigDecimal remainingBalance,

        boolean alertCreated,

        // -------- NEW --------

        String razorpayOrderId,

        String razorpayPaymentId

) {
}