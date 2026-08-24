package com.frauddetection.backend.controller;

import com.frauddetection.backend.dto.common.ApiResponse;
import com.frauddetection.backend.dto.request.FraudSimulationRequest;
import com.frauddetection.backend.dto.response.PredictionResponse;
import com.frauddetection.backend.service.FraudSimulatorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/simulator")
public class FraudSimulatorController {

    private final FraudSimulatorService fraudSimulatorService;

    public FraudSimulatorController(
            FraudSimulatorService fraudSimulatorService
    ) {
        this.fraudSimulatorService = fraudSimulatorService;
    }

    @PostMapping("/predict")
    public ResponseEntity<ApiResponse<PredictionResponse>> simulate(

            @Valid
            @RequestBody FraudSimulationRequest request

    ) {

        PredictionResponse response =
                fraudSimulatorService.simulate(request);

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }
}