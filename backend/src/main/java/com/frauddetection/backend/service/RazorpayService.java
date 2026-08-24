package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.response.RazorpayOrderResponse;

import java.math.BigDecimal;

public interface RazorpayService {

    RazorpayOrderResponse createOrder(BigDecimal amount) throws Exception;

}