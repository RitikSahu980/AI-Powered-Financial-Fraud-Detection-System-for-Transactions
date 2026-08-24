package com.frauddetection.backend.repository;

import com.frauddetection.backend.entity.Feedback;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

/** Persistence abstraction for the feedback collection. Contains no business logic. findAll(Pageable) inherited. */
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    Optional<Feedback> findByPredictionId(String predictionId);

    List<Feedback> findByReviewedBy(String reviewer);
}
