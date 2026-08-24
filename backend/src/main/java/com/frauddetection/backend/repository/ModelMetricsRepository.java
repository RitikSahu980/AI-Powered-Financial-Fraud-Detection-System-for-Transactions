package com.frauddetection.backend.repository;

import com.frauddetection.backend.entity.ModelMetrics;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

/** Persistence abstraction for the model_metrics collection. Contains no business logic. */
public interface ModelMetricsRepository extends MongoRepository<ModelMetrics, String> {

    Optional<ModelMetrics> findByModelVersion(String modelVersion);

    Optional<ModelMetrics> findByIsActiveTrue();

    List<ModelMetrics> findAllByOrderByTrainedAtDesc();
}
