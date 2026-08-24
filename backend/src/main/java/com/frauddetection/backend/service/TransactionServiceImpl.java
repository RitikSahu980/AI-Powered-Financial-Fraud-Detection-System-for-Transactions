package com.frauddetection.backend.service;

import com.frauddetection.backend.client.MlClient;
import com.frauddetection.backend.config.properties.RiskThresholdProperties;
import com.frauddetection.backend.dto.ml.MlPredictionRequest;
import com.frauddetection.backend.dto.ml.MlPredictionResponse;
import com.frauddetection.backend.dto.request.CreateTransactionRequest;
import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.dto.response.TransactionResponse;
import com.frauddetection.backend.entity.Prediction;
import com.frauddetection.backend.entity.Transaction;
import com.frauddetection.backend.enums.AlertType;
import com.frauddetection.backend.enums.PredictionLabel;
import com.frauddetection.backend.enums.RiskLevel;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import com.frauddetection.backend.repository.TransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final MlClient mlClient;
    private final PredictionService predictionService;
    private final AlertService alertService;
    private final RiskThresholdProperties riskThresholdProperties;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            MlClient mlClient,
            PredictionService predictionService,
            AlertService alertService,
            RiskThresholdProperties riskThresholdProperties
    ) {
        this.transactionRepository = transactionRepository;
        this.mlClient = mlClient;
        this.predictionService = predictionService;
        this.alertService = alertService;
        this.riskThresholdProperties = riskThresholdProperties;
    }

    @Override
    public PredictionResponse submitTransaction(CreateTransactionRequest request, String userId) {
        log.info("Transaction received: type={} step={}", request.type(), request.step());

        Transaction savedTransaction = persistTransaction(request, userId);

        MlPredictionResponse mlResponse = requestPrediction(savedTransaction);

        PredictionLabel predictionLabel = toPredictionLabel(mlResponse.prediction());
        double confidence = calculateConfidence(mlResponse.fraudProbability(), predictionLabel);
        RiskLevel riskLevel = calculateRiskLevel(mlResponse.fraudProbability());

        Prediction savedPrediction = persistPrediction(savedTransaction, mlResponse, predictionLabel, confidence, riskLevel);

        boolean alertCreated = maybeCreateAlert(savedTransaction, savedPrediction, riskLevel);

        return PredictionResponse.builder()
                .transactionId(savedTransaction.getTransactionId())
                .prediction(mlResponse.prediction())
                .predictionLabel(predictionLabel)
                .fraudProbability(mlResponse.fraudProbability())
                .confidence(confidence)
                .riskLevel(riskLevel)
                .modelVersion(mlResponse.modelVersion())
                .processingMs(mlResponse.processingMs())
                .alertCreated(alertCreated)
                .build();
    }
    
    @Override
    public void updateRazorpayDetails(
            String transactionId,
            String razorpayOrderId,
            String razorpayPaymentId
    ) {

        Transaction transaction = transactionRepository
                .findByTransactionId(transactionId)
                .orElseThrow(() ->
                        ResourceNotFoundException.of("Transaction", transactionId));

        transaction.setRazorpayOrderId(razorpayOrderId);
        transaction.setRazorpayPaymentId(razorpayPaymentId);

        transactionRepository.save(transaction);
    }
    
    private Transaction persistTransaction(CreateTransactionRequest request, String userId) {
    	Transaction transaction = Transaction.builder()
    	        .userId(userId)
    	        .step(request.step())
    	        .type(request.type())
    	        .paymentMethod(request.paymentMethod())

    	        // NEW
    	        .razorpayOrderId(request.razorpayOrderId())
    	        .razorpayPaymentId(request.razorpayPaymentId())

    	        .amount(request.amount())
    	        .nameOrig(request.nameOrig())
    	        .oldbalanceOrg(request.oldbalanceOrg())
    	        .newbalanceOrig(request.newbalanceOrig())
    	        .nameDest(request.nameDest())
    	        .oldbalanceDest(request.oldbalanceDest())
    	        .newbalanceDest(request.newbalanceDest())
    	        .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Transaction persisted: transactionId={}", saved.getTransactionId());
        return saved;
    }

    private MlPredictionResponse requestPrediction(Transaction transaction) {
        MlPredictionRequest mlRequest = MlPredictionRequest.builder()
                .step(transaction.getStep())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .oldbalanceOrg(transaction.getOldbalanceOrg())
                .newbalanceOrig(transaction.getNewbalanceOrig())
                .oldbalanceDest(transaction.getOldbalanceDest())
                .newbalanceDest(transaction.getNewbalanceDest())
                .build();

        log.info("Prediction requested: transactionId={}", transaction.getTransactionId());
        MlPredictionResponse response = mlClient.predict(mlRequest);
        log.info("Prediction completed: transactionId={} prediction={} fraudProbability={}",
                transaction.getTransactionId(), response.prediction(), response.fraudProbability());
        return response;
    }

    private Prediction persistPrediction(
            Transaction transaction,
            MlPredictionResponse mlResponse,
            PredictionLabel predictionLabel,
            double confidence,
            RiskLevel riskLevel
    ) {
        Prediction prediction = Prediction.builder()
                .transactionId(transaction.getTransactionId())
                .prediction(predictionLabel)
                .fraudProbability(mlResponse.fraudProbability())
                .confidence(confidence)
                .riskLevel(riskLevel)
                .modelVersion(mlResponse.modelVersion())
                .processingMs(mlResponse.processingMs())
                .predictedAt(Instant.now())
                .build();

        return predictionService.savePrediction(prediction);
    }

    private boolean maybeCreateAlert(Transaction transaction, Prediction prediction, RiskLevel riskLevel) {
        if (riskLevel != RiskLevel.HIGH) {
            return false;
        }
        alertService.createAlert(transaction.getTransactionId(), prediction.getPredictionId(), AlertType.HIGH_RISK_TRANSACTION);
        return true;
    }

    /** Maps the ML service's raw 0/1 output to its human-readable label. */
    private PredictionLabel toPredictionLabel(int rawPrediction) {
        return rawPrediction == 1 ? PredictionLabel.FRAUDULENT : PredictionLabel.NOT_FRAUDULENT;
    }

    private double calculateConfidence(double fraudProbability, PredictionLabel predictionLabel) {
        double confidence = (predictionLabel == PredictionLabel.FRAUDULENT)
                ? fraudProbability
                : 1.0 - fraudProbability;
        return BigDecimal.valueOf(confidence).setScale(10, RoundingMode.HALF_UP).doubleValue();
    }

    private RiskLevel calculateRiskLevel(double fraudProbability) {
        if (fraudProbability >= riskThresholdProperties.highRiskMinProbability()) {
            return RiskLevel.HIGH;
        }
        if (fraudProbability >= riskThresholdProperties.mediumRiskMinProbability()) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }

    @Override
    public TransactionResponse getTransactionById(String transactionId) {
        return transactionRepository.findByTransactionId(transactionId)
                .map(this::toTransactionResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", transactionId));
    }

    @Override
    public List<TransactionResponse> getTransactionsByUserId(String userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    @Override
    public Page<TransactionResponse> getTransactionsByUserId(String userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable).map(this::toTransactionResponse);
    }

    private TransactionResponse toTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .userId(transaction.getUserId())
                .step(transaction.getStep())
                .type(transaction.getType())
                .paymentMethod(transaction.getPaymentMethod())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .amount(transaction.getAmount())
                .nameOrig(transaction.getNameOrig())
                .oldbalanceOrg(transaction.getOldbalanceOrg())
                .newbalanceOrig(transaction.getNewbalanceOrig())
                .nameDest(transaction.getNameDest())
                .oldbalanceDest(transaction.getOldbalanceDest())
                .newbalanceDest(transaction.getNewbalanceDest())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
    
    @Override
    public Page<TransactionResponse> getAllTransactions(Pageable pageable) {

        return transactionRepository
                .findAll(pageable)
                .map(this::toTransactionResponse);

    }
}
