import { useCallback, useEffect, useState } from "react";
import { getTransactionsByUser } from "../services/transactionService";
import { getPredictionByTransactionId } from "../services/predictionService";
import { getUserById } from "../services/authService";
import { normalizeApiError } from "../api/axios";
import { useToast } from "../context/ToastContext";

const SAMPLE_SIZE = 25;
const RECENT_SIZE = 5;

function isToday(date) {
  return new Date(date).toDateString() === new Date().toDateString();
}

export function useUserDashboard(userId) {
  const toast = useToast();

  const [transactions, setTransactions] = useState({
    content: [],
    totalElements: 0,
  });

  const [predictionsByTxnId, setPredictionsByTxnId] = useState({});
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const [page, user] = await Promise.all([
        getTransactionsByUser(userId, {
          page: 0,
          size: SAMPLE_SIZE,
          sort: "createdAt,desc",
        }),
        getUserById(userId),
      ]);

      setTransactions(page);

      setBalance(Number(user.walletBalance));

      const outcomes = await Promise.allSettled(
        page.content.map((t) => getPredictionByTransactionId(t.transactionId)),
      );

      const map = {};

      page.content.forEach((t, i) => {
        if (outcomes[i].status === "fulfilled") {
          map[t.transactionId] = outcomes[i].value;
        }
      });

      setPredictionsByTxnId(map);
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const todaysSpending = transactions.content
    .filter((t) => isToday(t.createdAt))
    .reduce((sum, t) => sum + t.amount, 0);

  const screenedCount = transactions.content.filter(
    (t) => predictionsByTxnId[t.transactionId],
  ).length;

  const recentTransactions = transactions.content
    .slice(0, RECENT_SIZE)
    .map((t) => ({
      transaction: t,
      prediction: predictionsByTxnId[t.transactionId] ?? null,
    }));

  return {
    isLoading,
    balance,
    totalTransactions: transactions.totalElements,
    todaysSpending,
    screenedCount,
    recentTransactions,
    refetch: load,
  };
}
