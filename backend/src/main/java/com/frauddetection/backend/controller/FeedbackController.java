package com.frauddetection.backend.controller;

import com.frauddetection.backend.dto.common.ApiResponse;
import com.frauddetection.backend.dto.common.ErrorResponse;
import com.frauddetection.backend.dto.common.ValidationErrorResponse;
import com.frauddetection.backend.dto.request.FeedbackRequest;
import com.frauddetection.backend.dto.response.FeedbackResponse;
import com.frauddetection.backend.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTTP entry point for submitting and retrieving analyst feedback.
 *
 * <p>This controller performs no prediction-related logic and contains no
 * try/catch blocks - {@code ResourceNotFoundException} for the lookup
 * endpoint propagates to {@code GlobalExceptionHandler} (Module 8).
 * {@link #submitFeedback} does not document a 404 response: Module 6's
 * {@code FeedbackService} deliberately does not verify the referenced
 * prediction's existence, so this endpoint genuinely cannot produce one.
 *
 * <p><b>Reviewer identity (interim):</b> {@code reviewedBy} is read from an
 * {@code X-User-Id} request header, the same interim pattern used in
 * {@link TransactionController} for {@code userId}.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/feedback")
@Tag(name = "Feedback Management", description = "Submit and retrieve analyst verdicts on reviewed predictions.")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * Submits an analyst's feedback for a reviewed prediction.
     *
     * @param request    the verdict and optional notes; validated via {@code @Valid}
     * @param reviewedBy identifier of the submitting analyst, from the {@code X-User-Id} header
     * @return {@code 201 Created} with the persisted feedback record
     */
    @PostMapping
    @Operation(
            summary = "Submit analyst feedback",
            description = "Records an analyst's verdict (Genuine / Fraudulent / False Positive) for a reviewed "
                    + "prediction. Does not verify that the referenced prediction exists - see class Javadoc."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201", description = "Feedback submitted successfully.",
                    content = @Content(schema = @Schema(implementation = FeedbackResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400", description = "Request failed validation.",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ValidationErrorResponse.class)))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "The verdict and optional notes.", required = true,
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "predictionId": "PRED-001",
                              "actualOutcome": "FRAUDULENT",
                              "comments": "Confirmed with customer - unauthorized transfer."
                            }""")))
            @Valid @RequestBody FeedbackRequest request,
            @Parameter(description = "Identifier of the submitting analyst (interim stand-in for an "
                    + "authenticated caller).", example = "USR-002", required = true)
            @RequestHeader("X-User-Id") String reviewedBy
    ) {
        log.info("POST /api/v1/feedback invoked: predictionId={}", request.predictionId());

        FeedbackResponse response = feedbackService.saveFeedback(request, reviewedBy);

        log.info("Request completed: POST /api/v1/feedback status=201 feedbackId={}", response.feedbackId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully.", response));
    }

    /**
     * Finds the feedback submitted for a given prediction.
     *
     * @param predictionId identifier of the prediction the feedback evaluates
     * @return {@code 200 OK} with the feedback
     */
    @GetMapping("/prediction/{predictionId}")
    @Operation(summary = "Get feedback for a prediction",
            description = "Finds the analyst feedback submitted for the given prediction, if any.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", description = "Feedback found.",
                    content = @Content(schema = @Schema(implementation = FeedbackResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404", description = "No feedback has been submitted for the given prediction.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500", description = "An unexpected error occurred.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ApiResponse<FeedbackResponse>> getFeedbackByPredictionId(
            @Schema(description = "Identifier of the prediction the feedback evaluates.", example = "PRED-001")
            @PathVariable String predictionId
    ) {
        log.info("GET /api/v1/feedback/prediction/{} invoked", predictionId);

        FeedbackResponse response = feedbackService.getFeedbackByPredictionId(predictionId);

        log.info("Request completed: GET /api/v1/feedback/prediction/{} status=200", predictionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
