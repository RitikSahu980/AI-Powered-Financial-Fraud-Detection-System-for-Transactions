package com.frauddetection.backend.repository;

import com.frauddetection.backend.entity.Transaction;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

/** Persistence abstraction for the transactions collection. Contains no business logic. */
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUserId(String userId);

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findByCreatedAtBetween(Instant start, Instant end);

    Page<Transaction> findByUserId(String userId, Pageable pageable);
}
