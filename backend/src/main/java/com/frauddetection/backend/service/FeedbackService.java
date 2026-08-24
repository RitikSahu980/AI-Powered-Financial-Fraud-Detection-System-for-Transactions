package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.request.FeedbackRequest;
import com.frauddetection.backend.dto.response.FeedbackResponse;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Feedback persistence and retrieval. Contains no prediction logic - this
 * service only stores an analyst's already-decided verdict; it does not
 * fetch, recompute, or validate anything about the prediction itself.
 *
 * <p>{@code reviewedBy} is accepted as an explicit parameter rather than
 * read from a security context, matching this module's "authentication is
 * not implemented yet" scope (the same pattern used for {@code userId} in
 * {@code TransactionService}). Wiring this from an authenticated caller's
 * identity is a future security-module concern.
 */
public interface FeedbackService {

    /**
     * Saves an analyst's feedback for a reviewed prediction.
     *
     * @param request    the verdict and optional notes
     * @param reviewedBy identifier of the analyst submitting this feedback
     * @return the persisted feedback record
     */
    FeedbackResponse saveFeedback(FeedbackRequest request, String reviewedBy);

    /**
     * Finds the feedback submitted for a given prediction.
     *
     * @param predictionId identifier of the prediction the feedback evaluates
     * @return the matching feedback
     * @throws ResourceNotFoundException if no feedback has been submitted for the given prediction
     */
    FeedbackResponse getFeedbackByPredictionId(String predictionId);

    /**
     * Finds all feedback submitted by a given reviewer.
     *
     * @param reviewedBy identifier of the analyst who submitted the feedback
     * @return all matching feedback records, in no particular guaranteed order
     */
    List<FeedbackResponse> getFeedbackByReviewer(String reviewedBy);

    /**
     * Finds a page of all feedback records.
     *
     * @param pageable pagination and sorting parameters
     * @return the requested page of feedback records
     */
    Page<FeedbackResponse> getAllFeedback(Pageable pageable);
}
