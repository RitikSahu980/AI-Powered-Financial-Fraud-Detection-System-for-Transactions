import { getUserById } from "./authService";
import {
  getTransactionsByUser,
  getAllTransactions,
} from "./transactionService";
import {
  getPredictionHistory,
  getPredictionByTransactionId,
} from "./predictionService";
import { getOpenAlerts } from "./alertService";

const RECENT_TRANSACTIONS_SAMPLE_SIZE = 50;
const RECENT_TRANSACTIONS_TABLE_SIZE = 5;

/**
 * Loads all data required for the Admin Dashboard.
 *
 * Admins and Analysts:
 *   - View ALL transactions.
 *
 * Users:
 *   - View only their own transactions.
 */
export async function getDashboardData(userId, role = "USER") {
  const transactionRequest =
    role === "ADMIN" || role === "ANALYST"
      ? getAllTransactions({
          page: 0,
          size: RECENT_TRANSACTIONS_SAMPLE_SIZE,
          sort: "createdAt,desc",
        })
      : getTransactionsByUser(userId, {
          page: 0,
          size: RECENT_TRANSACTIONS_SAMPLE_SIZE,
          sort: "createdAt,desc",
        });

  const [
    userResult,
    transactionsResult,
    predictionHistoryResult,
    alertsResult,
  ] = await Promise.allSettled([
    getUserById(userId),
    transactionRequest,
    getPredictionHistory({
      page: 0,
      size: RECENT_TRANSACTIONS_SAMPLE_SIZE,
      sort: "predictionId,desc",
    }),
    getOpenAlerts(),
  ]);

  const transactions =
    transactionsResult.status === "fulfilled"
      ? transactionsResult.value
      : {
          content: [],
          totalElements: 0,
        };

  const predictionResults =
    transactionsResult.status === "fulfilled"
      ? await Promise.allSettled(
          transactions.content.map((transaction) =>
            getPredictionByTransactionId(transaction.transactionId),
          ),
        )
      : [];

  const predictionsByTxnId = {};

  transactions.content.forEach((transaction, index) => {
    const result = predictionResults[index];

    if (result?.status === "fulfilled") {
      predictionsByTxnId[transaction.transactionId] = result.value;
    }
  });

  return {
    user: userResult.status === "fulfilled" ? userResult.value : null,

    userError: userResult.status === "rejected" ? userResult.reason : null,

    transactions,

    transactionsError:
      transactionsResult.status === "rejected"
        ? transactionsResult.reason
        : null,

    predictionsByTxnId,

    predictionHistory:
      predictionHistoryResult.status === "fulfilled"
        ? predictionHistoryResult.value
        : {
            content: [],
            totalElements: 0,
          },

    predictionHistoryError:
      predictionHistoryResult.status === "rejected"
        ? predictionHistoryResult.reason
        : null,

    alerts: alertsResult.status === "fulfilled" ? alertsResult.value : [],

    alertsError:
      alertsResult.status === "rejected" ? alertsResult.reason : null,
  };
}

export { RECENT_TRANSACTIONS_TABLE_SIZE };
