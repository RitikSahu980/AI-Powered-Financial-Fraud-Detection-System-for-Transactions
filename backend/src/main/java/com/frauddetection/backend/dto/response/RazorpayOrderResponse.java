package com.frauddetection.backend.dto.response;

import lombok.Builder;

@Builder
public record RazorpayOrderResponse(

        String orderId,

        Integer amount,

        String currency,

        String key

) {}