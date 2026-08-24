package com.frauddetection.backend.entity;

import com.frauddetection.backend.enums.AccountStatus;
import com.frauddetection.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** A platform user account (Analyst, Administrator, or general User). Maps to the {@code users} collection. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "passwordHash")
@Document(collection = "users")
public class User {

    @Id
    private String userId;

    @Indexed(unique = true)
    private String username;

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    @Indexed(unique = true)
    private String email;

    @NotBlank
    private String passwordHash;

    @NotNull
    private UserRole role;

    @NotNull
    private AccountStatus accountStatus;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
    
    @NotNull
    @Builder.Default
    private BigDecimal walletBalance = new BigDecimal("1000000.00");
}
