package com.frauddetection.backend.controller;

import com.frauddetection.backend.dto.common.ApiResponse;
import com.frauddetection.backend.dto.common.ErrorResponse;
import com.frauddetection.backend.dto.common.ValidationErrorResponse;
import com.frauddetection.backend.dto.request.CreateTransactionRequest;
import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.dto.response.TransactionResponse;
import com.frauddetection.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transaction Processing", description = "Submit transactions for fraud analysis and browse "
        + "transaction history. The core prediction workflow lives here.")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @Operation(
            summary = "Submit a transaction for fraud analysis",
            description = "Persists the transaction, requests a fraud prediction from the Python ML service, "
                    + "derives confidence and risk level, creates an alert if the risk level is HIGH, and "
                    + "returns the complete prediction result. All orchestration happens in the service layer; "
                    + "this endpoint performs no calculation of its own."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "Transaction processed successfully.",
                    content = @Content(schema = @Schema(implementation = PredictionResponse.class), examples = @ExampleObject(value = """
                            {
                              "transactionId": "TXN-001",
                              "prediction": 1,
                              "predictionLabel": "FRAUDULENT",
                              "fraudProbability": 0.99993,
                              "confidence": 0.99993,
                              "riskLevel": "HIGH",
                              "modelVersion": "xgboost_v1",
                              "processingMs": 42,
                              "alertCreated": true
                            }"""))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Request failed validation.",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ValidationErrorResponse.class)))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "503", description = "The Fraud Detection (Python ML) Service is currently unavailable.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<PredictionResponse>> submitTransaction(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "The transaction to analyze.", required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "step": 1,
                              "type": "TRANSFER",
                              "amount": 181,
                              "nameOrig": "C123456789",
                              "oldbalanceOrg": 181,
                              "newbalanceOrig": 0,
                              "nameDest": "C987654321",
                              "oldbalanceDest": 0,
                              "newbalanceDest": 0
                            }""")))
            @Valid @RequestBody CreateTransactionRequest request,
            @Parameter(description = "Identifier of the submitting user (interim stand-in for an "
                    + "authenticated caller - see class Javadoc).", example = "USR-001", required = true)
            @RequestHeader("X-User-Id") String userId
    ) {
        log.info("POST /api/v1/transactions invoked: userId={} type={}", userId, request.type());

        PredictionResponse response = transactionService.submitTransaction(request, userId);

        log.info(
                "Request completed: POST /api/v1/transactions status=201 transactionId={} riskLevel={} alertCreated={}",
                response.transactionId(), response.riskLevel(), response.alertCreated()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction processed successfully.", response));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get a user's transaction history",
            description = "Returns a paginated list of transactions submitted by the given user.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Page of transactions returned (may be empty).",
                    content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactionHistory(
            @Schema(description = "Identifier of the user whose history is requested.", example = "USR-001")
            @PathVariable String userId,
            Pageable pageable
    ) {
        log.info("GET /api/v1/transactions/user/{} invoked", userId);

        Page<TransactionResponse> page = transactionService.getTransactionsByUserId(userId, pageable);

        log.info(
                "Request completed: GET /api/v1/transactions/user/{} status=200 totalElements={}",
                userId, page.getTotalElements()
        );
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get a transaction by identifier", description = "Finds a stored transaction by its unique identifier.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Transaction found.",
                    content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No transaction exists with the given identifier.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(
            @Schema(description = "The transaction's identifier.", example = "TXN-001") @PathVariable String transactionId
    ) {
        log.info("GET /api/v1/transactions/{} invoked", transactionId);

        TransactionResponse response = transactionService.getTransactionById(transactionId);

        log.info("Request completed: GET /api/v1/transactions/{} status=200", transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getAllTransactions(
            Pageable pageable
    ) {

        Page<TransactionResponse> page =
                transactionService.getAllTransactions(pageable);

        return ResponseEntity.ok(ApiResponse.success(page));
    }
    
}
