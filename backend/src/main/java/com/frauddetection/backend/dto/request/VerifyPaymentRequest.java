package com.frauddetection.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record VerifyPaymentRequest(

		@NotBlank
        String razorpayOrderId,

        @NotBlank
        String razorpayPaymentId,

        @NotBlank
        String razorpaySignature,

        @NotBlank
        String userId,

        @Valid
        PaymentRequest payment

) {
}