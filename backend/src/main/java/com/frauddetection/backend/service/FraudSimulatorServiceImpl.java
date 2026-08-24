package com.frauddetection.backend.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.frauddetection.backend.dto.request.CreateTransactionRequest;
import com.frauddetection.backend.dto.request.FraudSimulationRequest;
import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.enums.TransactionType;

@Service
public class FraudSimulatorServiceImpl implements FraudSimulatorService {

    private final TransactionService transactionService;

    public FraudSimulatorServiceImpl(
            TransactionService transactionService
    ) {
        this.transactionService = transactionService;
    }

    @Override
    public PredictionResponse simulate(FraudSimulationRequest request) {

        CreateTransactionRequest transaction;

        switch (request.scenario().toUpperCase()) {

            case "NORMAL" ->

                    transaction = CreateTransactionRequest.builder()
                            .step(1)
                            .type(TransactionType.PAYMENT)
                            .paymentMethod("UPI")
                            .amount(BigDecimal.valueOf(500))
                            .nameOrig("SIM_USER")
                            .oldbalanceOrg(BigDecimal.valueOf(10000))
                            .newbalanceOrig(BigDecimal.valueOf(9500))
                            .nameDest("SIM_DEST")
                            .oldbalanceDest(BigDecimal.valueOf(5000))
                            .newbalanceDest(BigDecimal.valueOf(5500))
                            .build();

            case "SUSPICIOUS" ->

                    transaction = CreateTransactionRequest.builder()
                            .step(742)
                            .type(TransactionType.TRANSFER)
                            .paymentMethod("BANK_TRANSFER")
                            .amount(BigDecimal.valueOf(75000))
                            .nameOrig("SIM_USER")
                            .oldbalanceOrg(BigDecimal.valueOf(80000))
                            .newbalanceOrig(BigDecimal.valueOf(5000))
                            .nameDest("SIM_DEST")
                            .oldbalanceDest(BigDecimal.ZERO)
                            .newbalanceDest(BigDecimal.valueOf(75000))
                            .build();

            case "FRAUD" ->

                    transaction = CreateTransactionRequest.builder()
                            .step(742)
                            .type(TransactionType.TRANSFER)
                            .paymentMethod("BANK_TRANSFER")
                            .amount(BigDecimal.valueOf(303846.74))
                            .nameOrig("SIM_USER")
                            .oldbalanceOrg(BigDecimal.valueOf(303846.74))
                            .newbalanceOrig(BigDecimal.ZERO)
                            .nameDest("SIM_DEST")
                            .oldbalanceDest(BigDecimal.ZERO)
                            .newbalanceDest(BigDecimal.ZERO)
                            .build();

            default ->
                    throw new IllegalArgumentException("Unknown simulation scenario.");

        }

        return transactionService.submitTransaction(
                transaction,
                "SIMULATOR"
        );
    }
}