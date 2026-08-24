package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.response.RazorpayOrderResponse;
import com.frauddetection.backend.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Override
    public RazorpayOrderResponse createOrder(BigDecimal amount) throws Exception {

        JSONObject request = new JSONObject();

        request.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());

        request.put("currency", "INR");

        request.put("receipt", "receipt_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(request);

        return RazorpayOrderResponse.builder()
                .orderId(order.get("id"))
                .amount(order.get("amount"))
                .currency(order.get("currency"))
                .key(keyId)
                .build();
    }
}