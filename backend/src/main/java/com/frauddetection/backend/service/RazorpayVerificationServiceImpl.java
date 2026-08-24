package com.frauddetection.backend.service;

import com.frauddetection.backend.service.RazorpayVerificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class RazorpayVerificationServiceImpl
        implements RazorpayVerificationService {

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Override
    public boolean verify(
            String orderId,
            String paymentId,
            String signature
    ) {

        try {

            String payload = orderId + "|" + paymentId;

            Mac sha256Hmac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKey =
                    new SecretKeySpec(
                            keySecret.getBytes(StandardCharsets.UTF_8),
                            "HmacSHA256"
                    );

            sha256Hmac.init(secretKey);

            byte[] hash =
                    sha256Hmac.doFinal(
                            payload.getBytes(StandardCharsets.UTF_8)
                    );

            String generatedSignature = bytesToHex(hash);

            return generatedSignature.equals(signature);

        } catch (Exception e) {
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {

        StringBuilder builder = new StringBuilder();

        for (byte b : bytes) {
            builder.append(String.format("%02x", b));
        }

        return builder.toString();
    }
}