package com.frauddetection.backend.repository;

import com.frauddetection.backend.entity.Prediction;
import com.frauddetection.backend.enums.RiskLevel;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

/** Persistence abstraction for the predictions collection. Contains no business logic. findAll(Pageable) inherited. */
public interface PredictionRepository extends MongoRepository<Prediction, String> {

    Optional<Prediction> findByPredictionId(String predictionId);

    Optional<Prediction> findByTransactionId(String transactionId);

    List<Prediction> findByRiskLevel(RiskLevel riskLevel);

    List<Prediction> findByModelVersion(String modelVersion);
}
