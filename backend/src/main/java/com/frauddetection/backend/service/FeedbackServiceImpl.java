package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.request.FeedbackRequest;
import com.frauddetection.backend.dto.response.FeedbackResponse;
import com.frauddetection.backend.entity.Feedback;
import com.frauddetection.backend.exception.ResourceNotFoundException;
import com.frauddetection.backend.repository.FeedbackRepository;
import java.time.Instant;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Default implementation of {@link FeedbackService}.
 *
 * <p>Contains no prediction logic - the referenced prediction's existence
 * is not verified here, since no such requirement was specified for this
 * module; this service's sole job is to store and retrieve feedback
 * records as given.
 */
@Slf4j
@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackServiceImpl(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Override
    public FeedbackResponse saveFeedback(FeedbackRequest request, String reviewedBy) {
        Feedback feedback = Feedback.builder()
                .predictionId(request.predictionId())
                .actualOutcome(request.actualOutcome())
                .comments(request.comments())
                .reviewedBy(reviewedBy)
                .reviewedAt(Instant.now())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        log.info("Feedback saved: feedbackId={} predictionId={} actualOutcome={}",
                saved.getFeedbackId(), saved.getPredictionId(), saved.getActualOutcome());

        return toFeedbackResponse(saved);
    }

    @Override
    public FeedbackResponse getFeedbackByPredictionId(String predictionId) {
        return feedbackRepository.findByPredictionId(predictionId)
                .map(this::toFeedbackResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Feedback for prediction", predictionId));
    }

    @Override
    public List<FeedbackResponse> getFeedbackByReviewer(String reviewedBy) {
        return feedbackRepository.findByReviewedBy(reviewedBy).stream()
                .map(this::toFeedbackResponse)
                .toList();
    }

    @Override
    public Page<FeedbackResponse> getAllFeedback(Pageable pageable) {
        return feedbackRepository.findAll(pageable).map(this::toFeedbackResponse);
    }

    private FeedbackResponse toFeedbackResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .feedbackId(feedback.getFeedbackId())
                .predictionId(feedback.getPredictionId())
                .actualOutcome(feedback.getActualOutcome())
                .comments(feedback.getComments())
                .reviewedBy(feedback.getReviewedBy())
                .reviewedAt(feedback.getReviewedAt())
                .build();
    }
}
