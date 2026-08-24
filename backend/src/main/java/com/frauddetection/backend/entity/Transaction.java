package com.frauddetection.backend.entity;

import com.frauddetection.backend.enums.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
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

/**
 * The raw transaction as submitted by the frontend, persisted before any ML prediction is requested.
 * Deliberately excludes origBalanceDiff/destBalanceDiff - those are computed inside the ML service only.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Document(collection = "transactions")
public class Transaction {

    @Id
    private String transactionId;

    @NotBlank
    @Indexed
    private String userId;

    @NotNull
    @Min(1)
    private Integer step;

    @NotNull
    private TransactionType type;
    
    @NotBlank
    private String paymentMethod;
    
    private String razorpayOrderId;

    private String razorpayPaymentId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    private String nameOrig;

    @NotNull
    @PositiveOrZero
    private BigDecimal oldbalanceOrg;

    @NotNull
    @PositiveOrZero
    private BigDecimal newbalanceOrig;

    @NotBlank
    private String nameDest;

    @NotNull
    @PositiveOrZero
    private BigDecimal oldbalanceDest;

    @NotNull
    @PositiveOrZero
    private BigDecimal newbalanceDest;

    @CreatedDate
    private Instant createdAt;
}
