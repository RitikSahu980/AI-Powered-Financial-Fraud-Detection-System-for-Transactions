package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.response.AlertResponse;
import com.frauddetection.backend.entity.Alert;
import com.frauddetection.backend.enums.AlertStatus;
import com.frauddetection.backend.enums.AlertType;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import com.frauddetection.backend.repository.AlertRepository;
import java.time.Instant;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Default implementation of {@link AlertService}.
 *
 * <p>{@link #resolveAlert}, {@link #dismissAlert}, and {@link #getAlertById}
 * throw {@link ResourceNotFoundException} for an unknown {@code alertId},
 * translated into an HTTP 404 by {@code GlobalExceptionHandler} (Module 8).
 */
@Slf4j
@Service
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;

    public AlertServiceImpl(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Override
    public Alert createAlert(String transactionId, String predictionId, AlertType alertType) {
        Alert alert = Alert.builder()
                .transactionId(transactionId)
                .predictionId(predictionId)
                .alertType(alertType)
                .alertStatus(AlertStatus.OPEN)
                .build();

        Alert saved = alertRepository.save(alert);
        log.info("Alert generated: alertId={} transactionId={} predictionId={} alertType={}",
                saved.getAlertId(), transactionId, predictionId, alertType);
        return saved;
    }

    @Override
    public AlertResponse resolveAlert(String alertId, String notes) {
        Alert alert = findAlertOrThrow(alertId);
        alert.setAlertStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(Instant.now());
        alert.setNotes(notes);

        Alert saved = alertRepository.save(alert);
        log.info("Alert resolved: alertId={}", saved.getAlertId());
        return toAlertResponse(saved);
    }

    @Override
    public AlertResponse dismissAlert(String alertId, String notes) {
        Alert alert = findAlertOrThrow(alertId);
        alert.setAlertStatus(AlertStatus.DISMISSED);
        alert.setResolvedAt(Instant.now());
        alert.setNotes(notes);

        Alert saved = alertRepository.save(alert);
        log.info("Alert dismissed: alertId={}", saved.getAlertId());
        return toAlertResponse(saved);
    }

    @Override
    public List<AlertResponse> getOpenAlerts() {
        return alertRepository.findByAlertStatus(AlertStatus.OPEN).stream()
                .map(this::toAlertResponse)
                .toList();
    }

    @Override
    public AlertResponse getAlertById(String alertId) {
        return alertRepository.findById(alertId)
                .map(this::toAlertResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Alert", alertId));
    }

    private Alert findAlertOrThrow(String alertId) {
        return alertRepository.findById(alertId)
                .orElseThrow(() -> ResourceNotFoundException.of("Alert", alertId));
    }

    private AlertResponse toAlertResponse(Alert alert) {
        return AlertResponse.builder()
                .alertId(alert.getAlertId())
                .transactionId(alert.getTransactionId())
                .predictionId(alert.getPredictionId())
                .alertType(alert.getAlertType())
                .alertStatus(alert.getAlertStatus())
                .createdAt(alert.getCreatedAt())
                .resolvedAt(alert.getResolvedAt())
                .notes(alert.getNotes())
                .build();
    }
}
