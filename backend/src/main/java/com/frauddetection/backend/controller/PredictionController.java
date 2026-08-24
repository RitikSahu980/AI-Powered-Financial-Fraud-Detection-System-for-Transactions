package com.frauddetection.backend.controller;

import com.frauddetection.backend.dto.common.ApiResponse;
import com.frauddetection.backend.dto.common.ErrorResponse;
import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTTP entry point for read-only prediction lookup and history.
 *
 * <p>This controller performs no calculation of its own - every field on
 * every {@link PredictionResponse} it returns was already computed and
 * persisted by {@code TransactionServiceImpl} at submission time (Module
 * 6). It contains no try/catch blocks - {@code ResourceNotFoundException}
 * propagates to {@code GlobalExceptionHandler} (Module 8) for the two
 * single-resource lookups below.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/predictions")
@Tag(name = "Prediction Management", description = "Read-only access to fraud prediction results and history.")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    /**
     * Finds a prediction by its identifier.
     *
     * @param predictionId the prediction's identifier
     * @return {@code 200 OK} with the prediction
     */
    @GetMapping("/{predictionId}")
    @Operation(summary = "Get a prediction by identifier", description = "Finds a fraud prediction result by its unique identifier.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Prediction found.",
                    content = @Content(schema = @Schema(implementation = PredictionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No prediction exists with the given identifier.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<PredictionResponse>> getPredictionById(
            @Schema(description = "The prediction's identifier.", example = "PRED-001") @PathVariable String predictionId
    ) {
        log.info("GET /api/v1/predictions/{} invoked", predictionId);

        PredictionResponse response = predictionService.getPredictionById(predictionId);

        log.info("Request completed: GET /api/v1/predictions/{} status=200", predictionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Finds the prediction generated for a given transaction.
     *
     * @param transactionId identifier of the transaction the prediction concerns
     * @return {@code 200 OK} with the prediction
     */
    @GetMapping("/transaction/{transactionId}")
    @Operation(summary = "Get the prediction for a transaction",
            description = "Finds the fraud prediction result generated for the given transaction.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Prediction found.",
                    content = @Content(schema = @Schema(implementation = PredictionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No prediction exists for the given transaction.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<PredictionResponse>> getPredictionByTransactionId(
            @Schema(description = "Identifier of the transaction the prediction concerns.", example = "TXN-001")
            @PathVariable String transactionId
    ) {
        log.info("GET /api/v1/predictions/transaction/{} invoked", transactionId);

        PredictionResponse response = predictionService.getPredictionByTransactionId(transactionId);

        log.info("Request completed: GET /api/v1/predictions/transaction/{} status=200", transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Returns a page of all predictions.
     *
     * @param pageable pagination and sorting parameters, resolved from query parameters
     * @return {@code 200 OK} with the requested page, even if empty
     */
    @GetMapping
    @Operation(summary = "Get prediction history", description = "Returns a paginated list of all fraud predictions.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Page of predictions returned (may be empty).",
                    content = @Content(schema = @Schema(implementation = PredictionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<Page<PredictionResponse>>> getPredictionHistory(Pageable pageable) {
        log.info("GET /api/v1/predictions invoked");

        Page<PredictionResponse> page = predictionService.getPredictionHistory(pageable);

        log.info("Request completed: GET /api/v1/predictions status=200 totalElements={}", page.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(page));
    }
}
