package com.frauddetection.backend.repository;

import com.frauddetection.backend.entity.Alert;
import com.frauddetection.backend.enums.AlertStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

/** Persistence abstraction for the alerts collection. Contains no business logic. */
public interface AlertRepository extends MongoRepository<Alert, String> {

    List<Alert> findByAlertStatus(AlertStatus status);

    List<Alert> findByCreatedAtBetween(Instant start, Instant end);

    Optional<Alert> findByPredictionId(String predictionId);

    Page<Alert> findByAlertStatus(AlertStatus status, Pageable pageable);
}
