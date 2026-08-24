import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Brain,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import RiskDistributionChart from "../../components/dashboard/RiskDistributionChart";

import { getPredictionHistory } from "../../services/predictionService";

import { normalizeApiError } from "../../api/axios";

import { useToast } from "../../context/ToastContext";

import AnalyticsCard from "../../components/analytics/AnalyticsCard";

const SAMPLE_SIZE = 100;

export default function AnalyticsPage() {
  const toast = useToast();

  const [predictions, setPredictions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setIsLoading(true);

    try {
      const response = await getPredictionHistory({
        page: 0,
        size: SAMPLE_SIZE,
        sort: "predictionId,desc",
      });

      setPredictions(response.content);

      setTotalElements(response.totalElements);

      setLastUpdated(new Date());
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }

  const analytics = useMemo(() => {
    const fraudulent = predictions.filter(
      (p) => p.predictionLabel === "FRAUDULENT",
    ).length;

    const safe = predictions.filter(
      (p) => p.predictionLabel === "NOT_FRAUDULENT",
    ).length;

    const highRisk = predictions.filter((p) => p.riskLevel === "HIGH").length;

    const mediumRisk = predictions.filter(
      (p) => p.riskLevel === "MEDIUM",
    ).length;

    const lowRisk = predictions.filter((p) => p.riskLevel === "LOW").length;

    const alertsCreated = predictions.filter((p) => p.alertCreated).length;

    const averageProcessing =
      predictions.length === 0
        ? 0
        : Math.round(
            predictions.reduce((sum, p) => sum + (p.processingMs ?? 0), 0) /
              predictions.length,
          );

    const averageConfidence =
      predictions.length === 0
        ? 0
        : (
            (predictions.reduce((sum, p) => sum + (p.confidence ?? 0), 0) /
              predictions.length) *
            100
          ).toFixed(1);

    const latestModel =
      predictions.length > 0 ? predictions[0].modelVersion : "--";

    return {
      fraudulent,
      safe,

      highRisk,
      mediumRisk,
      lowRisk,

      alertsCreated,

      averageProcessing,

      averageConfidence,

      latestModel,
    };
  }, [predictions]);

  const predictionChart = [
    {
      label: "Safe",
      count: analytics.safe,
    },
    {
      label: "Fraud",
      count: analytics.fraudulent,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">
            Sentinel Pay Analytics
          </h1>

          <p className="mt-2 text-slate-500">
            AI-powered fraud detection monitoring dashboard
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Last Updated • {lastUpdated.toLocaleString()}
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />

          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ================= KPI CARDS ================= */}

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          title="Total Predictions"
          value={totalElements}
          subtitle="Platform-wide"
          icon={Activity}
          color="blue"
        />

        <AnalyticsCard
          title="High Risk"
          value={analytics.highRisk}
          subtitle={`${analytics.mediumRisk} Medium • ${analytics.lowRisk} Low`}
          icon={AlertTriangle}
          color="red"
        />

        <AnalyticsCard
          title="Average Confidence"
          value={`${analytics.averageConfidence}%`}
          subtitle="ML Prediction Confidence"
          icon={ShieldCheck}
          color="green"
        />

        <AnalyticsCard
          title="Avg Processing"
          value={`${analytics.averageProcessing} ms`}
          subtitle={analytics.latestModel}
          icon={Brain}
          color="purple"
        />
      </div>

      {/* ================= CHARTS ================= */}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* ================= RISK DISTRIBUTION ================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Risk Distribution
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Distribution of AI risk classifications
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
              {predictions.length} Samples
            </div>
          </div>

          {isLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <RiskDistributionChart
              predictions={predictions}
              isLoading={false}
            />
          )}
        </div>

        {/* ================= PREDICTION OUTCOMES ================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Prediction Outcomes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Safe vs Fraudulent transactions
            </p>
          </div>

          {isLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={predictionChart}
                  margin={{
                    top: 10,
                    right: 20,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#64748B",
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#64748B",
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: "#F8FAFC",
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    }}
                  />

                  <Bar dataKey="count" fill="#2563EB" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODEL SUMMARY ================= */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ================= MODEL PERFORMANCE ================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Model Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Machine Learning inference statistics
          </p>

          <div className="mt-8 space-y-5">
            <MetricRow label="Model Version" value={analytics.latestModel} />

            <MetricRow
              label="Average Confidence"
              value={`${analytics.averageConfidence}%`}
            />

            <MetricRow
              label="Average Processing Time"
              value={`${analytics.averageProcessing} ms`}
            />

            <MetricRow label="Predictions Analysed" value={totalElements} />

            <MetricRow label="Fraud Detected" value={analytics.fraudulent} />

            <MetricRow label="Safe Transactions" value={analytics.safe} />
          </div>
        </div>

        {/* ================= RISK SUMMARY ================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Risk Summary</h2>

          <p className="mt-1 text-sm text-slate-500">AI Risk Classification</p>

          <div className="mt-8 space-y-8">
            {/* LOW */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-green-600">LOW</span>

                <span className="font-semibold">{analytics.lowRisk}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${
                      predictions.length
                        ? (analytics.lowRisk / predictions.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* MEDIUM */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-amber-600">MEDIUM</span>

                <span className="font-semibold">{analytics.mediumRisk}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{
                    width: `${
                      predictions.length
                        ? (analytics.mediumRisk / predictions.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* HIGH */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-red-600">HIGH</span>

                <span className="font-semibold">{analytics.highRisk}</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-red-500 transition-all"
                  style={{
                    width: `${
                      predictions.length
                        ? (analytics.highRisk / predictions.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Overall Detection */}

          <div className="mt-10 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Fraud Detection Rate</p>

            <h3 className="mt-2 text-3xl font-bold text-red-600">
              {predictions.length
                ? ((analytics.fraudulent / predictions.length) * 100).toFixed(1)
                : 0}
              %
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Based on the latest {predictions.length} analysed transactions.
            </p>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}

      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-sm text-slate-500">
          Sentinel Pay Analytics Dashboard • Powered by{" "}
          <span className="font-semibold text-slate-700">
            {analytics.latestModel}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ======================================================
   Helper Components
====================================================== */

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-sm font-medium text-slate-500">{label}</span>

      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
