import api, { normalizeApiError } from "../api/axios";

/**
 * Runs one of the predefined AI simulation scenarios.
 */
export async function runFraudSimulation(scenario) {
  try {
    const response = await api.post("/simulator/predict", {
      scenario,
    });

    return response.data.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
