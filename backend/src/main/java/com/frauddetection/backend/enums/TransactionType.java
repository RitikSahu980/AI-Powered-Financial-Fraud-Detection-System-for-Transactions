package com.frauddetection.backend.enums;

/** Transaction type categories, matching the ML model's encoder categories. */
public enum TransactionType {
    CASH_IN,
    CASH_OUT,
    DEBIT,
    PAYMENT,
    TRANSFER
}
