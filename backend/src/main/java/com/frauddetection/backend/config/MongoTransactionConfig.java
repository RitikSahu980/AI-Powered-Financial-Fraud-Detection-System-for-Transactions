package com.frauddetection.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;

/**
 * Registers the {@link MongoTransactionManager} bean required for
 * {@code @Transactional} to have any effect against MongoDB.
 *
 * <p><b>Why this exists:</b> discovered while implementing the Service
 * Layer module, which explicitly requires {@code @Transactional} on
 * operations spanning multiple collections (e.g. {@code TransactionService}
 * persisting a Transaction, then a Prediction, then possibly an Alert).
 * Spring Boot does not auto-configure a MongoDB
 * {@code PlatformTransactionManager} on its own; without this bean,
 * {@code @Transactional} on a Spring Data MongoDB repository/service
 * either silently does nothing or fails at runtime with
 * "No qualifying bean of type PlatformTransactionManager" the first time
 * an annotated method is invoked. This is treated as a genuine,
 * narrowly-scoped bug fix to Module 1's configuration - one bean, no other
 * Module 1 file touched.
 *
 * <p><b>Deployment note:</b> MongoDB multi-document transactions require
 * the target MongoDB deployment to run as a replica set (even a
 * single-node replica set is sufficient for local development) - a
 * standalone {@code mongod} will reject transactional operations at
 * runtime. This is a deployment/infrastructure concern for the
 * docker-compose / MongoDB setup, not something this bean can work around.
 */
@Configuration
public class MongoTransactionConfig {

    @Bean
    public MongoTransactionManager mongoTransactionManager(MongoDatabaseFactory mongoDatabaseFactory) {
        return new MongoTransactionManager(mongoDatabaseFactory);
    }
}
