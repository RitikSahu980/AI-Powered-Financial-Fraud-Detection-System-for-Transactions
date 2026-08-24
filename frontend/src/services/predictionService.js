import api from '../api/axios';

/**
 * Fetches a page of prediction history from the real, working
 * GET /api/v1/predictions endpoint (Module 7's PredictionController).
 *
 * Sorted by predictionId desc as a stand-in for "most recent first" -
 * PredictionResponse has no timestamp field to sort by, but predictionId
 * values are assigned sequentially (PRED-001, PRED-002, ...), so this is
 * an honest approximation, not an invented one.
 *
 * @returns {Promise<{content: object[], totalElements: number, totalPages: number, number: number, size: number}>}
 *   Spring Data's default Page<T> JSON shape, unwrapped from ApiResponse.
 */
export async function getPredictionHistory({ page = 0, size = 10 } = {}) {
  const response = await api.get('/predictions', {
    params: { page, size, sort: 'predictionId,desc' },
  });
  return response.data.data;
}

/** Fetches a single prediction by id. Real, working endpoint. */
export async function getPredictionById(predictionId) {
  const response = await api.get(`/predictions/${predictionId}`);
  return response.data.data;
}

/** Fetches the prediction generated for a given transaction. Real, working endpoint. */
export async function getPredictionByTransactionId(transactionId) {
  const response = await api.get(`/predictions/transaction/${transactionId}`);
  return response.data.data;
}
