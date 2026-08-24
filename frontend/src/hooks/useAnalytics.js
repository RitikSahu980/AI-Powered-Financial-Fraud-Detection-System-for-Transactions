import { useEffect, useState } from "react";

import { getAnalyticsData } from "../services/analyticsService";

export function useAnalytics() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getAnalyticsData();

      const predictions = data.predictions.content;

      const totalPredictions = data.predictions.totalElements;

      const highRisk = predictions.filter((p) => p.riskLevel === "HIGH").length;

      const mediumRisk = predictions.filter(
        (p) => p.riskLevel === "MEDIUM",
      ).length;

      const lowRisk = predictions.filter((p) => p.riskLevel === "LOW").length;

      const totalProcessingTime = predictions.reduce(
        (sum, p) => sum + p.processingMs,
        0,
      );

      const averageProcessingTime =
        predictions.length === 0
          ? 0
          : Math.round(totalProcessingTime / predictions.length);

      const latestModel = predictions.length
        ? predictions[0].modelVersion
        : "--";

      const accuracy =
        predictions.length === 0
          ? 0
          : ((lowRisk / predictions.length) * 100).toFixed(2);

      setStats({
        totalPredictions,

        openAlerts: data.alerts.length,

        totalUsers: data.users.totalElements,

        highRisk,

        mediumRisk,

        lowRisk,

        averageProcessingTime,

        latestModel,

        accuracy,

        predictions,
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,

    stats,

    refresh: load,
  };
}
