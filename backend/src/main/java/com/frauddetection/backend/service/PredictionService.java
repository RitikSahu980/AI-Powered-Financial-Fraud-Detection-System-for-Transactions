package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.entity.Prediction;
import com.frauddetection.backend.enums.RiskLevel;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Prediction persistence and retrieval. No HTTP logic, no calls to the ML
 * service - this service only stores and reads already-computed
 * predictions.
 *
 * <p>This interface is deliberately dual-natured, by design, not by
 * accident:
 * <ul>
 *   <li>{@link #savePrediction(Prediction)} operates on the {@code Prediction}
 *       entity directly - it exists for internal service-to-service
 *       orchestration (called by {@code TransactionServiceImpl}, which has
 *       already computed confidence and risk level and just needs this
 *       service to persist the result), not for controller consumption.</li>
 *   <li>The remaining methods return {@code PredictionResponse} DTOs - these
 *       are the controller-facing surface (a later module), covering the
 *       "retrieve prediction" and "prediction history" responsibilities.</li>
 * </ul>
 * Entities are the natural shared vocabulary between cooperating internal
 * services; DTOs are reserved for the eventual controller boundary. No
 * internal-only "command" DTO was introduced for the entity-based method
 * since none was scoped in Module 3.
 *
 * <p><b>Note on {@code PredictionResponse.alertCreated}</b> in the
 * DTO-returning methods below: it is derived as {@code riskLevel == HIGH},
 * matching the current alert-trigger rule (Module 6, Step 10) exactly,
 * rather than by cross-referencing the alerts collection - keeping this
 * service free of any dependency on {@code AlertRepository}/{@code AlertService}.
 * If the alert-trigger rule ever changes (e.g. Medium risk also alerts, or
 * alerts become manually creatable), this derivation would need to become
 * a real cross-reference instead of an inferred proxy.
 */
public interface PredictionService {

    /**
     * Persists an already-fully-computed prediction (confidence and risk
     * level already set by the caller). This service performs no
     * calculation of its own - it is a pure persistence step.
     *
     * @param prediction the prediction to persist
     * @return the persisted prediction, with its generated identifier populated
     */
    Prediction savePrediction(Prediction prediction);

    /**
     * Finds a prediction by its identifier.
     *
     * @param predictionId the prediction's identifier
     * @return the matching prediction
     * @throws ResourceNotFoundException if no prediction exists with the given identifier
     */
    PredictionResponse getPredictionById(String predictionId);

    /**
     * Finds the prediction generated for a given transaction.
     *
     * @param transactionId identifier of the transaction the prediction concerns
     * @return the matching prediction
     * @throws ResourceNotFoundException if no prediction exists for the given transaction
     */
    PredictionResponse getPredictionByTransactionId(String transactionId);

    /**
     * Finds all predictions classified at a given risk level.
     *
     * @param riskLevel the risk level to filter by
     * @return all matching predictions, in no particular guaranteed order
     */
    List<PredictionResponse> getPredictionsByRiskLevel(RiskLevel riskLevel);

    /**
     * Finds a page of all predictions, most useful for a prediction history view.
     *
     * @param pageable pagination and sorting parameters
     * @return the requested page of predictions
     */
    Page<PredictionResponse> getPredictionHistory(Pageable pageable);
}
