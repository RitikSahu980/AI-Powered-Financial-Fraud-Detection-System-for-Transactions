package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.request.CreateTransactionRequest;
import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.dto.response.TransactionResponse;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionService {

    PredictionResponse submitTransaction(CreateTransactionRequest request, String userId);
    
    void updateRazorpayDetails(
            String transactionId,
            String razorpayOrderId,
            String razorpayPaymentId
    );

    TransactionResponse getTransactionById(String transactionId);

    List<TransactionResponse> getTransactionsByUserId(String userId);

    Page<TransactionResponse> getTransactionsByUserId(String userId, Pageable pageable);
    
    Page<TransactionResponse> getAllTransactions(Pageable pageable);
     
}
