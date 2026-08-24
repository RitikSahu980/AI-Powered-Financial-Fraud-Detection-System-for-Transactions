package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.response.AlertResponse;
import com.frauddetection.backend.entity.Alert;
import com.frauddetection.backend.enums.AlertType;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import java.util.List;

/**
 * Alert lifecycle management: creation, resolution, dismissal, and lookup.
 * No ML calls - alert creation is triggered by {@code TransactionServiceImpl}
 * after it has already computed a risk level; this service never decides
 * *whether* to create an alert, only performs the creation and subsequent
 * lifecycle transitions.
 *
 * <p>{@link #createAlert} operates on the {@code Alert} entity, for the
 * same internal-orchestration reason described in
 * {@link PredictionService}'s Javadoc; the remaining methods return
 * {@code AlertResponse} DTOs for eventual controller consumption.
 *
 * <p>Lookup and mutation methods throw {@link ResourceNotFoundException}
 * directly for an unknown {@code alertId}, per Module 8's design rule -
 * this keeps controllers free of conditional not-found handling.
 */
public interface AlertService {

    /**
     * Creates and persists a new alert for a High-risk prediction.
     *
     * @param transactionId identifier of the transaction the alert concerns
     * @param predictionId  identifier of the prediction that triggered the alert
     * @param alertType     why this alert is being created
     * @return the persisted alert, with its generated identifier populated
     */
    Alert createAlert(String transactionId, String predictionId, AlertType alertType);

    /**
     * Marks an alert as resolved, recording the analyst's closing notes.
     *
     * @param alertId the alert's identifier
     * @param notes   closing notes to attach to the alert; may be {@code null}
     * @return the updated alert
     * @throws ResourceNotFoundException if no alert exists with the given identifier
     */
    AlertResponse resolveAlert(String alertId, String notes);

    /**
     * Marks an alert as dismissed without a formal feedback verdict.
     *
     * @param alertId the alert's identifier
     * @param notes   closing notes to attach to the alert; may be {@code null}
     * @return the updated alert
     * @throws ResourceNotFoundException if no alert exists with the given identifier
     */
    AlertResponse dismissAlert(String alertId, String notes);

    /**
     * Finds all alerts currently awaiting analyst review.
     *
     * @return all open alerts, in no particular guaranteed order
     */
    List<AlertResponse> getOpenAlerts();

    /**
     * Finds an alert by its identifier.
     *
     * @param alertId the alert's identifier
     * @return the matching alert
     * @throws ResourceNotFoundException if no alert exists with the given identifier
     */
    AlertResponse getAlertById(String alertId);
}
