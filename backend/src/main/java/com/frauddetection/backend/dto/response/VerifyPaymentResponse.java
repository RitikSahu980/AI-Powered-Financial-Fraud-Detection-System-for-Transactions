package com.frauddetection.backend.dto.response;

import lombok.Builder;

@Builder
public record VerifyPaymentResponse(

        boolean verified,

        PaymentResponse payment

) {
}