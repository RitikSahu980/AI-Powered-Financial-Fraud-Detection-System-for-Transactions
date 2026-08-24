package com.frauddetection.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables {@code @CreatedDate} / {@code @LastModifiedDate} auditing for
 * MongoDB documents.
 */
@Configuration
@EnableMongoAuditing
public class MongoAuditingConfig {
}
