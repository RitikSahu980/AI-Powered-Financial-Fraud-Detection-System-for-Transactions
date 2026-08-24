package com.frauddetection.backend.controller;

import com.frauddetection.backend.dto.common.ApiResponse;
import com.frauddetection.backend.dto.common.ErrorResponse;
import com.frauddetection.backend.dto.response.AlertResponse;
import com.frauddetection.backend.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTTP entry point for alert triage: viewing open alerts, resolving or
 * dismissing them, and looking up alert details.
 *
 * <p>This controller makes no decision about *whether* an alert should
 * exist - alert creation happens exclusively inside
 * {@code TransactionServiceImpl} (Module 6) as a side effect of
 * transaction submission. This class only exposes the lifecycle
 * operations Module 6's {@link AlertService} already defines, and contains
 * no try/catch blocks - {@code ResourceNotFoundException} for an unknown
 * {@code alertId} propagates to {@code GlobalExceptionHandler} (Module 8).
 *
 * <p><b>Resolution notes (interim):</b> {@code resolve}/{@code dismiss}
 * accept an optional {@code notes} query parameter rather than a request
 * body DTO, since no such DTO exists in Module 3.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/alerts")
@Tag(name = "Alert Management", description = "Fraud alert triage: view open alerts, resolve or dismiss them, "
        + "and look up alert details. Alerts are created automatically by the transaction submission workflow.")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    /**
     * Returns all alerts currently awaiting analyst review.
     *
     * @return {@code 200 OK} with the list of open alerts, even if empty
     */
    @GetMapping("/open")
    @Operation(summary = "Get all open alerts", description = "Returns every alert currently awaiting analyst review.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Open alerts returned (may be empty).",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = AlertResponse.class)))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getOpenAlerts() {
        log.info("GET /api/v1/alerts/open invoked");

        List<AlertResponse> openAlerts = alertService.getOpenAlerts();

        log.info("Request completed: GET /api/v1/alerts/open status=200 count={}", openAlerts.size());
        return ResponseEntity.ok(ApiResponse.success(openAlerts));
    }

    /**
     * Marks an alert as resolved.
     *
     * @param alertId the alert's identifier
     * @param notes   optional closing notes
     * @return {@code 200 OK} with the updated alert
     */
    @PutMapping("/{alertId}/resolve")
    @Operation(summary = "Resolve an alert", description = "Marks an alert as resolved, with optional closing notes.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Alert resolved successfully.",
                    content = @Content(schema = @Schema(implementation = AlertResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No alert exists with the given identifier.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<AlertResponse>> resolveAlert(
            @Schema(description = "The alert's identifier.", example = "ALT-001") @PathVariable String alertId,
            @Parameter(description = "Optional closing notes.", example = "Confirmed with customer - unauthorized transfer.")
            @RequestParam(required = false) String notes
    ) {
        log.info("PUT /api/v1/alerts/{}/resolve invoked", alertId);

        AlertResponse response = alertService.resolveAlert(alertId, notes);

        log.info("Request completed: PUT /api/v1/alerts/{}/resolve status=200", alertId);
        return ResponseEntity.ok(ApiResponse.success("Alert resolved successfully.", response));
    }

    /**
     * Marks an alert as dismissed, without a formal feedback verdict.
     *
     * @param alertId the alert's identifier
     * @param notes   optional closing notes
     * @return {@code 200 OK} with the updated alert
     */
    @PutMapping("/{alertId}/dismiss")
    @Operation(summary = "Dismiss an alert",
            description = "Marks an alert as dismissed without a formal feedback verdict, with optional closing notes.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Alert dismissed successfully.",
                    content = @Content(schema = @Schema(implementation = AlertResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No alert exists with the given identifier.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<AlertResponse>> dismissAlert(
            @Schema(description = "The alert's identifier.", example = "ALT-001") @PathVariable String alertId,
            @Parameter(description = "Optional closing notes.", example = "Known benign pattern - false positive.")
            @RequestParam(required = false) String notes
    ) {
        log.info("PUT /api/v1/alerts/{}/dismiss invoked", alertId);

        AlertResponse response = alertService.dismissAlert(alertId, notes);

        log.info("Request completed: PUT /api/v1/alerts/{}/dismiss status=200", alertId);
        return ResponseEntity.ok(ApiResponse.success("Alert dismissed successfully.", response));
    }

    /**
     * Finds an alert by its identifier.
     *
     * @param alertId the alert's identifier
     * @return {@code 200 OK} with the alert
     */
    @GetMapping("/{alertId}")
    @Operation(summary = "Get an alert by identifier", description = "Finds an alert by its unique identifier.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Alert found.",
                    content = @Content(schema = @Schema(implementation = AlertResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No alert exists with the given identifier.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<AlertResponse>> getAlertById(
            @Schema(description = "The alert's identifier.", example = "ALT-001") @PathVariable String alertId
    ) {
        log.info("GET /api/v1/alerts/{} invoked", alertId);

        AlertResponse response = alertService.getAlertById(alertId);

        log.info("Request completed: GET /api/v1/alerts/{} status=200", alertId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
