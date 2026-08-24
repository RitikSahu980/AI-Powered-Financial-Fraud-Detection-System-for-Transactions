# Testing Guide

This document covers how to run this backend's test suite, what it
requires, and how to troubleshoot the most likely failure modes.

## Required tools

| Tool | Why | Notes |
|---|---|---|
| Java 21 | Runtime | Same as production |
| Maven 3.9+ | Build/test runner | |
| **Docker (running daemon)** | Testcontainers spins up a real MongoDB (`mongo:7.0`) for every repository test and the integration test | **Hard requirement** - these tests will fail to even start their Spring context without it, not just fail assertions |
| Network access (first run only) | Maven needs to download test dependencies (JUnit 5, Mockito, Testcontainers, WireMock) and Docker needs to pull the `mongo:7.0` image | Subsequent runs use local caches |

No production credentials are used anywhere in the test suite -
`application-test.yml` and `AbstractMongoTestcontainersTest` are fully
isolated from any real database or external service.

## Running the tests

```bash
mvn test
```

Runs everything: unit tests (service, ML client), `@WebMvcTest` controller
tests, `@DataMongoTest` repository tests, and the full `@SpringBootTest`
integration tests.

To run just one category:

```bash
mvn test -Dtest="com.frauddetection.backend.service.*"
mvn test -Dtest="com.frauddetection.backend.controller.*"
mvn test -Dtest="com.frauddetection.backend.repository.*"
mvn test -Dtest="com.frauddetection.backend.client.*"
mvn test -Dtest="com.frauddetection.backend.integration.*"
```

## Testcontainers requirements and behavior

- Every repository test and the integration test class extend
  `testsupport.AbstractMongoTestcontainersTest`, which starts one shared
  `mongo:7.0` container (via `@Container static` + `@ServiceConnection`) for
  all tests in that JVM run.
- **First run will be slow** (pulling the `mongo:7.0` image). Subsequent
  runs reuse the cached image.
- If Docker is not running, tests extending this base class fail at
  **context startup**, before any test method executes - the failure will
  look like a Testcontainers/Docker connectivity error, not an assertion
  failure. See Troubleshooting below.
- Containers are **not** reused across separate `mvn test` invocations
  (only within a single run) - each full test run pays container startup
  cost once, not once per test class, but does pay it again on the next
  invocation. If you're iterating quickly, consider Testcontainers' reuse
  feature (`testcontainers.reuse.enable=true` in
  `~/.testcontainers.properties`) - not configured by default here, since
  it requires an opt-in on the developer's machine.

## Mocking strategy at a glance

| Layer | What's real | What's mocked |
|---|---|---|
| Service unit tests | The service implementation itself | Repositories, `MlClient`, collaborator services - via Mockito `@Mock`/`@InjectMocks` |
| Controller tests (`@WebMvcTest`) | Controller, request validation, `GlobalExceptionHandler` (real `@RestControllerAdvice`) | The service layer - via `@MockitoBean` (not the deprecated `@MockBean`) |
| Repository tests (`@DataMongoTest`) | A real MongoDB (Testcontainers), the actual Spring Data query derivation | Nothing - these are the least-mocked tests in the suite |
| ML client tests | `MlClientImpl`, a real `WebClient` | The Python ML service itself - via WireMock (`org.wiremock:wiremock`, not the deprecated `com.github.tomakehurst:wiremock-jre8`) |
| Integration tests (`@SpringBootTest`) | Controller, validation, service orchestration, `GlobalExceptionHandler`, a real MongoDB | Only `MlClient` (an interface) - via `@MockitoBean`. The Python service is a separate system per the frozen architecture; these tests verify integration *across this backend's own layers*, not a live cross-service call. |

## Integration scenarios covered

All four in `integration/TransactionWorkflowIntegrationTest.java`:

1. **Successful transaction** - submits a request, verifies the HTTP
   response, and separately re-queries MongoDB directly to confirm the
   Transaction, Prediction, and Alert documents actually exist (not just
   that the JSON response looked right).
2. **ML service unavailable** - `MlClient` mocked to throw
   `MlServiceException`, verifies HTTP 503 with the exact user-facing
   message, and verifies no Prediction/Alert was persisted.
3. **Validation failure** - a negative `amount`, verifies HTTP 400 with a
   `ValidationErrorResponse`-shaped JSON array (`field`/`rejectedValue`/`message`),
   and verifies nothing was persisted.
4. **Resource not found** - a lookup for a nonexistent transaction id,
   verifies HTTP 404 with the full `ErrorResponse` shape including `path`
   and `timestamp`.

## Coverage

JaCoCo is configured in `pom.xml` (`prepare-agent` + `report`, bound to the
`test` phase - no `check` goal enforced as a build-failing gate, since a
hard coverage threshold can incentivize low-value tests written just to
move a percentage rather than to verify behavior).

```bash
mvn test
open target/site/jacoco/index.html   # macOS; use xdg-open on Linux
```

**Coverage numbers in this repository's verification report are
estimates based on which methods/branches this test suite exercises, not
a number measured by actually running JaCoCo** - this development
environment has no Maven/JDK toolchain available to execute the build.
Run `mvn test` yourself and check `target/site/jacoco/index.html` for the
real numbers before relying on the estimates.

## Troubleshooting

**`Could not find a valid Docker environment`** / Testcontainers startup
failures
: Docker isn't running, or the current user can't access the Docker
  socket. Start Docker Desktop (or the daemon on Linux) and confirm
  `docker ps` works from the same shell you run `mvn test` from.

**Tests hang for a long time on first run**
: Almost always the `mongo:7.0` image downloading. Run `docker pull
  mongo:7.0` ahead of time to separate that cost from your first test run.

**`Address already in use` from WireMock**
: `MlClientImplTest` binds WireMock to a random free port (`new
  WireMockServer(0)`), so this shouldn't happen under normal
  circumstances. If it does, another process is likely interfering with
  ephemeral port allocation - rerun the test in isolation
  (`mvn test -Dtest=MlClientImplTest`) to confirm.

**Repository test assertions on `createdAt` fail with `null`**
: This would mean `MongoAuditingConfig` isn't active in that test's
  context. Every repository test should extend
  `AbstractMongoTestcontainersTest`, which explicitly
  `@Import(MongoAuditingConfig.class)` for exactly this reason - `@DataMongoTest`
  does not auto-scan arbitrary `@Configuration` classes the way a full
  `@SpringBootTest` does. If you add a new repository test class, make sure
  it extends that base class.

**`@MockitoBean` not found / compile error**
: Confirms you're on Spring Boot 3.4+ (`org.springframework.test.context.bean.override.mockito.MockitoBean`).
  This project's `pom.xml` targets Spring Boot 3.4.1; if that's been
  downgraded, either upgrade back or fall back to the older `@MockBean`
  (with the tradeoff that it's deprecated as of Spring Framework 6.2).

**Integration test fails with a Mongo transaction error**
: `TransactionServiceImpl.submitTransaction` uses `@Transactional`, which
  requires MongoDB running as a replica set (see `config/MongoTransactionConfig.java`
  and the main `README.md`). Testcontainers' `org.testcontainers.containers.MongoDBContainer`
  (the version pinned via this project's `testcontainers-bom`, 1.20.4)
  auto-initializes a single-node replica set on startup specifically to
  support transactional testing out of the box - no extra configuration
  should be needed in `AbstractMongoTestcontainersTest` for this to work.
  If you hit a "Transaction numbers are only allowed on a replica set
  member" error anyway, confirm the Testcontainers version actually in use
  (`mvn dependency:tree | grep testcontainers`) - this behavior has not
  always been the default across every historical Testcontainers version,
  and this note reflects the pinned version's expected behavior, not a
  guarantee verified by an actual run in this environment.
