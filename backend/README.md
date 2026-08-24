# Fraud Detection Backend (Spring Boot)

Owns transaction persistence, orchestration of the Python ML microservice,
confidence/risk-level derivation, alert creation, and feedback storage — per
the frozen technical contract. Contains no ML/preprocessing logic; that
lives entirely in the separate `ml-service` python project this backend
calls over HTTP.

## Build status

This project is being built in reviewable slices. Current state:

- [x] Module 1 — Project structure, Maven dependencies, configuration
- [x] Module 2 — Entities
- [x] Module 3 — DTOs
- [x] Module 4 — Repositories
- [x] Module 5 — Python ML client
- [x] Module 6 — Service layer
- [x] Module 7 — REST controllers
- [x] Module 8 — Global exception handling
- [x] Module 9 — OpenAPI / Swagger documentation
- [ ] Security / authentication
- [ ] Tests

## Requirements

- Java 21
- Maven 3.9+
- A running MongoDB instance, **configured as a replica set** (even a
  single-node one for local dev) — required for `@Transactional` to work
  against MongoDB; a standalone `mongod` will reject transactional writes
  at runtime. See `config/MongoTransactionConfig.java`.
- The `ml-service` Python microservice running and reachable

## Configuration

Configuration is profile-based (`SPRING_PROFILES_ACTIVE=dev` or `docker`).
No default profile is set deliberately — an unset profile fails fast at
startup rather than silently defaulting.

| Variable | Meaning | dev default | docker default |
|---|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fraud_detection_dev` | `mongodb://mongo:27017/fraud_detection` |
| `ML_SERVICE_BASE_URL` | Base URL of the Python ML microservice | `http://localhost:8000` | `http://ml-service:8000` |
| `ML_SERVICE_CONNECT_TIMEOUT_MS` | Max time to establish connection to ML service | `2000` | same |
| `ML_SERVICE_RESPONSE_TIMEOUT_MS` | Max time to wait for a prediction response | `10000` | same |
| `RISK_THRESHOLD_MEDIUM` | fraud_probability at/above this = Medium risk | `0.70` | same |
| `RISK_THRESHOLD_HIGH` | fraud_probability at/above this = High risk | `0.90` | same |
| `ACTIVE_MODEL_VERSION` | Label for the currently active model version | `xgboost_v1` | same |
| `SERVER_PORT` | Port this backend listens on | `8080` | same |

Risk thresholds (0.70 / 0.90) are the explicit business rule specified in
Module 6 — Medium risk starts at fraud_probability >= 0.70, High risk at
>= 0.90. Alerts are created only for **High** risk (Module 6, Step 10);
Medium-risk predictions are persisted and classified but do not currently
generate an alert.

## Running locally

```bash
export SPRING_PROFILES_ACTIVE=dev
export MONGODB_URI=mongodb://localhost:27017/fraud_detection_dev
export ML_SERVICE_BASE_URL=http://localhost:8000
mvn spring-boot:run
```

## Architecture boundary with the ML service

This backend calls exactly one external service for predictions:
`POST {ML_SERVICE_BASE_URL}/predict` via `MlClient`/`MlClientImpl` (Module
5). It sends only the seven fields the model requires and receives back
`{prediction, fraud_probability, model_version, processing_ms}`.
Confidence, risk_level, and alert creation are computed in
`TransactionServiceImpl` (Module 6), never inside the Python service.

**Confidence formula:** `fraudProbability` if the prediction is
Fraudulent, `1 - fraudProbability` if Not Fraudulent — never a flat
percentage transform. See `TransactionServiceImpl`'s class Javadoc for why
this specific formula is load-bearing (it's also what keeps every
`Prediction.confidence` value inside the entity's own
`@DecimalMax("1.0")` validation).

## API documentation

With the service running, Swagger UI is available at
`http://localhost:8080/swagger-ui.html` (redirects to
`/swagger-ui/index.html`), and the raw OpenAPI 3 document at
`http://localhost:8080/v3/api-docs`. Configured in `config/OpenApiConfig.java`.

Two naming collisions worth knowing if you extend the controllers further:
this project's own `ApiResponse<T>` DTO shares a name with Swagger's
per-status-code `@ApiResponse` annotation, and Spring's `@RequestBody`
shares a name with Swagger's request-body-documentation `@RequestBody`.
Both are resolved by fully-qualifying the Swagger annotation at each usage
site rather than importing it unqualified.

## Known open items

- **Password hashing is a placeholder** (`UserServiceImpl.placeholderHash`,
  unsalted SHA-256) — not adequate for production credential storage. Real
  hashing (`BCryptPasswordEncoder`/`Argon2PasswordEncoder`) is deferred to
  a future security module along with authentication itself.
- **`@Transactional` on `TransactionServiceImpl.submitTransaction` spans
  the blocking ML HTTP call** — a known, documented tradeoff (see that
  class's Javadoc), not an oversight. Revisit if ML latency becomes a
  practical concern for held database sessions.
- **Not-found / conflict / business-rule errors now use a proper exception
  hierarchy** (`ResourceNotFoundException` → 404, `DuplicateResourceException`
  → 409, `BusinessException`/`ValidationException` → 400), all translated by
  `GlobalExceptionHandler` (`@RestControllerAdvice`). This superseded Module
  6/7's original interim approach (`IllegalStateException`/
  `IllegalArgumentException` + per-controller try/catch) — Module 6's
  service interfaces and Module 7's controllers were both revised as part
  of Module 8 to remove that interim pattern entirely, per Module 8's
  explicit "controllers must not contain try/catch blocks" rule. See
  `GlobalExceptionHandler`'s class Javadoc for the two response body shapes
  used (bare `ErrorResponse` for single-message errors, bare
  `List<ValidationErrorResponse>` for field-level validation errors) and
  why they deliberately don't match Module 8's own illustrative combined
  JSON example (that shape isn't achievable without modifying or adding a
  DTO, both explicitly out of scope).
- **Caller identity is read from an `X-User-Id` request header**
  (`TransactionController`, `FeedbackController`), not a security context —
  no authentication exists yet. Replace with real extraction once a
  security module exists.
