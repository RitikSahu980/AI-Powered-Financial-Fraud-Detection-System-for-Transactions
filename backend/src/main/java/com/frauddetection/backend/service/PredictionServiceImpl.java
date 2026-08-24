package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.entity.Prediction;
import com.frauddetection.backend.enums.RiskLevel;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import com.frauddetection.backend.repository.PredictionRepository;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Default implementation of {@link PredictionService}.
 *
 * <p>Contains no ML calls and no confidence/risk-level calculation - by the
 * time a {@code Prediction} entity reaches {@link #savePrediction(Prediction)},
 * every value on it has already been computed by {@code TransactionServiceImpl}.
 */
@Slf4j
@Service
public class PredictionServiceImpl implements PredictionService {

    private final PredictionRepository predictionRepository;

    public PredictionServiceImpl(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    @Override
    public Prediction savePrediction(Prediction prediction) {
        Prediction saved = predictionRepository.save(prediction);
        log.info("Persistence completed: predictionId={} transactionId={}",
                saved.getPredictionId(), saved.getTransactionId());
        return saved;
    }

    @Override
    public PredictionResponse getPredictionById(String predictionId) {
        return predictionRepository.findByPredictionId(predictionId)
                .map(this::toPredictionResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Prediction", predictionId));
    }

    @Override
    public PredictionResponse getPredictionByTransactionId(String transactionId) {
        return predictionRepository.findByTransactionId(transactionId)
                .map(this::toPredictionResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Prediction for transaction", transactionId));
    }

    @Override
    public List<PredictionResponse> getPredictionsByRiskLevel(RiskLevel riskLevel) {
        return predictionRepository.findByRiskLevel(riskLevel).stream()
                .map(this::toPredictionResponse)
                .toList();
    }

    @Override
    public Page<PredictionResponse> getPredictionHistory(Pageable pageable) {
        return predictionRepository.findAll(pageable).map(this::toPredictionResponse);
    }

    /**
     * Maps a stored {@link Prediction} to its response DTO.
     *
     * <p>{@code prediction} (the raw 0/1) is reverse-derived from the stored
     * {@link com.frauddetection.backend.enums.PredictionLabel}, since the
     * entity stores only the mapped label, not the original integer -
     * lossless, since the mapping is a fixed one-to-one correspondence.
     * {@code alertCreated} is derived as {@code riskLevel == HIGH} - see
     * this class's interface Javadoc for why that is a deliberate proxy
     * rather than a real cross-reference to the alerts collection.
     */
    private PredictionResponse toPredictionResponse(Prediction prediction) {
        int rawPrediction = switch (prediction.getPrediction()) {
            case FRAUDULENT -> 1;
            case NOT_FRAUDULENT -> 0;
        };

        return PredictionResponse.builder()
                .transactionId(prediction.getTransactionId())
                .prediction(rawPrediction)
                .predictionLabel(prediction.getPrediction())
                .fraudProbability(prediction.getFraudProbability())
                .confidence(prediction.getConfidence())
                .riskLevel(prediction.getRiskLevel())
                .modelVersion(prediction.getModelVersion())
                .processingMs(prediction.getProcessingMs())
                .alertCreated(prediction.getRiskLevel() == RiskLevel.HIGH)
                .build();
    }
}
