package com.frauddetection.backend.entity;

import com.frauddetection.backend.enums.ActualOutcome;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** An analyst's verdict on a Prediction, recorded during alert investigation. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "feedback")
public class Feedback {

    @Id
    private String feedbackId;

    @NotBlank
    @Indexed
    private String predictionId;

    @NotNull
    private ActualOutcome actualOutcome;

    private String comments;

    @NotBlank
    private String reviewedBy;

    @NotNull
    private Instant reviewedAt;
}
