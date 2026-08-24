package com.frauddetection.backend.entity;

import com.frauddetection.backend.enums.AlertStatus;
import com.frauddetection.backend.enums.AlertType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** A fraud alert generated when a Prediction is classified as requiring analyst attention. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "alerts")
public class Alert {

    @Id
    private String alertId;

    @NotBlank
    @Indexed
    private String transactionId;

    @NotBlank
    @Indexed
    private String predictionId;

    @NotNull
    private AlertType alertType;

    @NotNull
    private AlertStatus alertStatus;

    @CreatedDate
    private Instant createdAt;

    private Instant resolvedAt;

    private String notes;
}
