import api from "../api/axios";

export async function getTransactionsByUser(
  userId,
  { page = 0, size = 25, sort = "createdAt,desc" } = {},
) {
  const response = await api.get(`/transactions/user/${userId}`, {
    params: { page, size, sort },
  });
  return response.data.data;
}

/**
 * Submits a transaction for fraud analysis. Real, working endpoint -
 * POST /api/v1/transactions (Module 6/7's TransactionController). The
 * X-User-Id header it requires is attached automatically by the shared
 * axios instance (src/api/axios.js), not built here per-call.
 *
 * @param {object} payload - exactly CreateTransactionRequest's fields:
 *   step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig,
 *   nameDest, oldbalanceDest, newbalanceDest. No other fields exist on
 *   that DTO - origBalanceDiff/destBalanceDiff are computed inside the
 *   Python ML service and are never sent by the caller.
 * @returns {Promise<object>} the full PredictionResponse.
 */
export async function createTransaction(payload) {
  const response = await api.post("/transactions", payload);
  return response.data.data;
}

/** Fetches a stored transaction by id. Real, working endpoint. */
export async function getTransaction(transactionId) {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data.data;
}

export async function getAllTransactions({
  page = 0,
  size = 25,
  sort = "createdAt,desc",
} = {}) {
  const response = await api.get("/transactions", {
    params: { page, size, sort },
  });

  return response.data.data;
}
