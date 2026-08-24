import { useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Brain } from "lucide-react";

import RiskBadge from "../../components/ui/RiskBadge";
import { runFraudSimulation } from "../../services/fraudSimulatorService";

export default function FraudSimulator() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = {
    NORMAL: {
      title: "Genuine Transaction",
      description: "Small payment with healthy account balances.",
      amount: "₹500",
      type: "PAYMENT",
      oldBalance: "₹10,000",
      newBalance: "₹9,500",
      destinationBefore: "₹5,000",
      destinationAfter: "₹5,500",
      expected: "LOW RISK",
      color: "green",
    },

    SUSPICIOUS: {
      title: "Suspicious Transaction",
      description: "Large transfer requiring additional verification.",
      amount: "₹75,000",
      type: "TRANSFER",
      oldBalance: "₹80,000",
      newBalance: "₹5,000",
      destinationBefore: "₹0",
      destinationAfter: "₹75,000",
      expected: "MEDIUM RISK",
      color: "yellow",
    },

    FRAUD: {
      title: "Fraudulent Transaction",
      description:
        "Real fraud example extracted from the PaySim training dataset.",
      amount: "₹303,846.74",
      type: "TRANSFER",
      oldBalance: "₹303,846.74",
      newBalance: "₹0",
      destinationBefore: "₹0",
      destinationAfter: "₹0",
      expected: "HIGH RISK",
      color: "red",
    },
  };

  async function handleRunPrediction() {
    if (!selectedScenario) return;

    try {
      setLoading(true);
      setPrediction(null);

      const result = await runFraudSimulation(selectedScenario);

      setPrediction(result);
    } catch (error) {
      console.error(error);
      alert("Unable to run AI simulation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">
          AI Fraud Simulator
        </h1>

        <p className="mt-2 text-slate-500">
          Test the trained XGBoost fraud detection model using predefined
          transaction scenarios.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* NORMAL */}

        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-card">
          <ShieldCheck className="mb-4 text-green-600" size={40} />

          <h2 className="text-xl font-semibold text-green-700">
            Genuine Transaction
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            Small payment with healthy account balances.
          </p>

          <div className="mt-5 rounded-xl bg-white p-4">
            <p>
              <strong>Amount:</strong> ₹500
            </p>
            <p>
              <strong>Type:</strong> PAYMENT
            </p>

            <p className="mt-3 text-green-600 font-semibold">
              Expected Result: LOW RISK
            </p>
          </div>

          <button
            onClick={() => setSelectedScenario("NORMAL")}
            className="mt-5 w-full rounded-xl bg-green-600 py-2 font-medium text-white hover:bg-green-700"
          >
            Select Scenario
          </button>
        </div>

        {/* SUSPICIOUS */}

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-card">
          <AlertTriangle className="mb-4 text-yellow-600" size={40} />

          <h2 className="text-xl font-semibold text-yellow-700">
            Suspicious Transaction
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            Large transfer requiring additional verification.
          </p>

          <div className="mt-5 rounded-xl bg-white p-4">
            <p>
              <strong>Amount:</strong> ₹75,000
            </p>
            <p>
              <strong>Type:</strong> TRANSFER
            </p>

            <p className="mt-3 text-yellow-600 font-semibold">
              Expected Result: MEDIUM RISK
            </p>
          </div>

          <button
            onClick={() => setSelectedScenario("SUSPICIOUS")}
            className="mt-5 w-full rounded-xl bg-yellow-600 py-2 font-medium text-white hover:bg-yellow-700"
          >
            Select Scenario
          </button>
        </div>

        {/* FRAUD */}

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-card">
          <ShieldAlert className="mb-4 text-red-600" size={40} />

          <h2 className="text-xl font-semibold text-red-700">
            Fraudulent Transaction
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            Very Large Transfer for Real Fraud example from Dataset.
          </p>

          <div className="mt-5 rounded-xl bg-white p-4">
            <p>
              <strong>Amount:</strong> ₹303,846.74
            </p>
            <p>
              <strong>Type:</strong> TRANSFER
            </p>

            <p className="mt-3 text-red-600 font-semibold">
              Expected Result: HIGH RISK
            </p>
          </div>

          <button
            onClick={() => setSelectedScenario("FRAUD")}
            className="mt-5 w-full rounded-xl bg-red-600 py-2 font-medium text-white hover:bg-red-700"
          >
            Select Scenario
          </button>
        </div>
      </div>
      {selectedScenario && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold text-ink">Transaction Details</h2>

          <p className="mt-1 text-sm text-slate-500">
            Review the simulated transaction before running the AI model.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Scenario
              </p>
              <p className="mt-1 text-lg font-semibold">
                {scenarios[selectedScenario].title}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Expected Behaviour
              </p>

              <RiskBadge
                value={scenarios[selectedScenario].expected.split(" ")[0]}
              />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Amount
              </p>

              <p className="mt-1 text-lg font-semibold">
                {scenarios[selectedScenario].amount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Transaction Type
              </p>

              <p className="mt-1 text-lg font-semibold">
                {scenarios[selectedScenario].type}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Origin Balance
              </p>

              <p className="mt-1">{scenarios[selectedScenario].oldBalance}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Remaining Balance
              </p>

              <p className="mt-1">{scenarios[selectedScenario].newBalance}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Destination Balance Before
              </p>

              <p className="mt-1">
                {scenarios[selectedScenario].destinationBefore}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Destination Balance After
              </p>

              <p className="mt-1">
                {scenarios[selectedScenario].destinationAfter}
              </p>
            </div>
          </div>

          {/* Run Button */}

          <div className="mt-10 flex justify-center">
            <button
              onClick={handleRunPrediction}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-azure px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Brain size={20} />

              {loading ? "Running AI Model..." : "Run AI Prediction"}
            </button>
          </div>

          {/* Prediction */}

          {prediction && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="mb-6 text-2xl font-bold text-ink">
                AI Prediction Result
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Prediction
                  </p>

                  <RiskBadge
                    value={prediction.predictionLabel}
                    kind="label"
                    size="lg"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Risk Level
                  </p>

                  <RiskBadge
                    value={prediction.riskLevel}
                    kind="risk"
                    size="lg"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Fraud Probability
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {(prediction.fraudProbability * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Confidence
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {(prediction.confidence * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Processing Time
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {prediction.processingMs} ms
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Model Version
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {prediction.modelVersion}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
