package com.frauddetection.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FraudSimulationRequest(

        @NotBlank
        String scenario

) {
}