package com.frauddetection.backend.client;

import com.frauddetection.backend.config.properties.MlServiceProperties;
import com.frauddetection.backend.dto.ml.MlPredictionRequest;
import com.frauddetection.backend.dto.ml.MlPredictionResponse;
import com.frauddetection.backend.exception.MlServiceException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeoutException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.codec.DecodingException;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.Exceptions;
import reactor.core.publisher.Mono;


@Slf4j
@Component
public class MlClientImpl implements MlClient {

    private final WebClient mlServiceWebClient;
    private final MlServiceProperties mlServiceProperties;

    public MlClientImpl(WebClient mlServiceWebClient, MlServiceProperties mlServiceProperties) {
        this.mlServiceWebClient = mlServiceWebClient;
        this.mlServiceProperties = mlServiceProperties;
    }

    @Override
    public MlPredictionResponse predict(MlPredictionRequest request) {
        Instant startedAt = Instant.now();
        log.info("ML prediction request started: type={} step={}", request.type(), request.step());

        MlPredictionResponse response;
        try {
            response = mlServiceWebClient.post()
                    .uri(mlServiceProperties.predictPath())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .flatMap(body -> Mono.error(MlServiceException.clientError(
                                            clientResponse.statusCode().value(), body))))
                    .onStatus(HttpStatusCode::is5xxServerError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .flatMap(body -> Mono.error(MlServiceException.serverError(
                                            clientResponse.statusCode().value(), body))))
                    .bodyToMono(MlPredictionResponse.class)
                    .timeout(Duration.ofMillis(mlServiceProperties.responseTimeoutMs()))
                    .block();
        } catch (MlServiceException e) {
            log.error("ML prediction request failed: reason={} httpStatus={}", e.getReason(), e.getHttpStatus());
            throw e;
        } catch (WebClientRequestException e) {
            log.error("ML service connection failure: {}", e.getMessage());
            throw MlServiceException.connectionFailure(e);
        } catch (DecodingException e) {
            log.error("ML service returned a response that could not be parsed: {}", e.getMessage());
            throw MlServiceException.invalidResponse(e);
        } catch (RuntimeException e) {
            Throwable rootCause = Exceptions.unwrap(e);
            if (rootCause instanceof TimeoutException) {
                log.error("ML service request timed out after {} ms", mlServiceProperties.responseTimeoutMs());
                throw MlServiceException.timeout(rootCause);
            }
            log.error("Unexpected error calling ML service: {}", rootCause.getMessage(), rootCause);
            throw MlServiceException.connectionFailure(rootCause);
        }

        validateResponseComplete(response);

        long totalElapsedMs = Duration.between(startedAt, Instant.now()).toMillis();
        log.info(
                "ML prediction request completed: prediction={} modelVersion={} mlProcessingMs={} totalElapsedMs={}",
                response.prediction(), response.modelVersion(), response.processingMs(), totalElapsedMs
        );

        return response;
    }

    private void validateResponseComplete(MlPredictionResponse response) {
        if (response == null
                || response.prediction() == null
                || response.fraudProbability() == null
                || response.modelVersion() == null
                || response.modelVersion().isBlank()) {
            throw MlServiceException.invalidResponse(
                    new IllegalStateException("ML service response was missing one or more required fields.")
            );
        }
    }
}
