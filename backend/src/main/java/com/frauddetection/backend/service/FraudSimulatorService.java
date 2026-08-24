package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.request.FraudSimulationRequest;
import com.frauddetection.backend.dto.response.PredictionResponse;

public interface FraudSimulatorService {

    PredictionResponse simulate(FraudSimulationRequest request);

}