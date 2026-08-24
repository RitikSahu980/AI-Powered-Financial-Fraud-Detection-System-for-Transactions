package com.frauddetection.backend.service;

public interface RazorpayVerificationService {

    boolean verify(
            String orderId,
            String paymentId,
            String signature
    );

}
