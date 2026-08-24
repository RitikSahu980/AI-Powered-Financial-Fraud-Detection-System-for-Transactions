import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDashboardData,
  RECENT_TRANSACTIONS_TABLE_SIZE,
} from "../services/dashboardService";
import { normalizeApiError } from "../api/axios";
import { useToast } from "../context/ToastContext";

const REFRESH_INTERVAL_MS = 30000;

function bucketByDay(transactions) {
  const counts = {};
  transactions.forEach((t) => {
    const day = new Date(t.createdAt).toISOString().slice(0, 10);
    counts[day] = (counts[day] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function weekOverWeekTrend(transactions) {
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  let thisWeek = 0;
  let lastWeek = 0;

  transactions.forEach((t) => {
    const age = now - new Date(t.createdAt).getTime();
    if (age >= 0 && age < oneWeekMs) thisWeek += 1;
    else if (age >= oneWeekMs && age < 2 * oneWeekMs) lastWeek += 1;
  });

  if (lastWeek === 0) return null;
  return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
}

export function useDashboard(userId, userRole) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);
  const toastedErrorsRef = useRef(new Set());

  const load = useCallback(async () => {
    if (!userId) return;
    if (hasLoadedOnce.current) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await getDashboardData(userId, userRole);
      setData(result);

      [
        ["user", result.userError],
        ["transactions", result.transactionsError],
        ["predictions", result.predictionHistoryError],
        ["alerts", result.alertsError],
      ].forEach(([key, err]) => {
        if (err && !toastedErrorsRef.current.has(key)) {
          toastedErrorsRef.current.add(key);
          toast.error(normalizeApiError(err).message);
        }
        if (!err) toastedErrorsRef.current.delete(key);
      });
    } finally {
      hasLoadedOnce.current = true;
      setIsLoading(false);
      setIsRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return undefined;
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [userId, load]);

  const transactions = data?.transactions?.content ?? [];
  const predictionsByTxnId = data?.predictionsByTxnId ?? {};
  const recentPredictions = data?.predictionHistory?.content ?? [];
  const alerts = data?.alerts ?? [];

  const recentTransactions = transactions
    .slice(0, RECENT_TRANSACTIONS_TABLE_SIZE)
    .map((t) => ({
      transaction: t,
      prediction: predictionsByTxnId[t.transactionId] ?? null,
    }));

  const highRiskCount = transactions.filter(
    (t) => predictionsByTxnId[t.transactionId]?.riskLevel === "HIGH",
  ).length;

  return {
    isLoading,
    isRefreshing,
    fullName: data?.user?.fullName ?? null,
    stats: {
      totalTransactions: data?.transactions?.totalElements ?? 0,
      totalTransactionsTrend: weekOverWeekTrend(transactions),
      totalPredictions: data?.predictionHistory?.totalElements ?? 0,
      openAlertsCount: alerts.length,
      highRiskCount,
      sampleSize: transactions.length,
    },
    trendData: bucketByDay(transactions),
    recentPredictions,
    recentTransactions,
    alerts,
    refetch: load,
  };
}
