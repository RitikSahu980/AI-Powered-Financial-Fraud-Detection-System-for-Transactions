import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Printer,
  CreditCard,
  Shield,
  Cpu,
} from "lucide-react";

import { getTransaction } from "../../services/transactionService";
import { getPredictionByTransactionId } from "../../services/predictionService";

import { normalizeApiError } from "../../api/axios";
import { useToast } from "../../context/ToastContext";

import Button from "../../components/ui/Button";
import RiskBadge from "../../components/ui/RiskBadge";

import { downloadReceipt } from "../../utils/pdfReceipt";

const DATE = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export default function UserTransactionDetails() {
  const { transactionId } = useParams();
  const toast = useToast();

  const [transaction, setTransaction] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const tx = await getTransaction(transactionId);

        if (cancelled) return;

        setTransaction(tx);

        try {
          const pred = await getPredictionByTransactionId(transactionId);

          if (!cancelled) setPrediction(pred);
        } catch {
          if (!cancelled) setPrediction(null);
        }
      } catch (err) {
        if (!cancelled) toast.error(normalizeApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="h-[600px] animate-pulse rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-semibold">Transaction Not Found</h2>

        <Link
          to="/user/history"
          className="mt-5 inline-flex text-blue-600 hover:underline"
        >
          Back
        </Link>
      </div>
    );
  }

  const paymentStatus =
    prediction?.riskLevel === "HIGH"
      ? "BLOCKED"
      : prediction?.riskLevel === "MEDIUM"
        ? "UNDER REVIEW"
        : "SUCCESS";

  const receipt = {
    transactionId: transaction.transactionId,
    recipientName: transaction.nameDest,
    recipientAccount: transaction.nameDest,
    amount: transaction.amount,
    paymentMethod: transaction.paymentMethod,
    paymentStatus,
    predictionLabel: prediction?.predictionLabel,
    riskLevel: prediction?.riskLevel,
    fraudProbability: prediction?.fraudProbability,
    confidence: prediction?.confidence,
    remainingBalance: transaction.newbalanceOrig,
    razorpayOrderId: transaction.razorpayOrderId,
    razorpayPaymentId: transaction.razorpayPaymentId,
  };

  const score = Math.max(
    0,
    Math.round(100 - (prediction?.fraudProbability ?? 0) * 100),
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between">
        <Link
          to="/user/history"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to History
        </Link>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print
          </Button>

          <Button icon={Download} onClick={() => downloadReceipt(receipt)}>
            Download Receipt
          </Button>
        </div>
      </div>

      {/* HERO CARD */}

      <div className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-widest opacity-80">
          Transaction Summary
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          {CURRENCY.format(transaction.amount)}
        </h1>

        <div className="mt-4 inline-flex rounded-full bg-white/20 px-5 py-2 text-sm font-semibold">
          {paymentStatus}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-white/70 text-sm">Recipient</p>

            <p className="mt-1 text-xl font-semibold">{transaction.nameDest}</p>
          </div>

          <div>
            <p className="text-white/70 text-sm">Transaction ID</p>

            <p className="mt-1 font-mono text-sm break-all">
              {transaction.transactionId}
            </p>
          </div>

          <div>
            <p className="text-white/70 text-sm">Date</p>

            <p className="mt-1">
              {DATE.format(new Date(transaction.createdAt))}
            </p>
          </div>
        </div>
      </div>
      {/* CONTENT */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* PAYMENT INFORMATION */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <CreditCard className="text-blue-600" size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold">Payment Information</h2>

              <p className="text-sm text-slate-500">Complete payment details</p>
            </div>
          </div>

          <InfoRow label="Recipient" value={transaction.nameDest} />

          <InfoRow label="Recipient Account" value={transaction.nameDest} />

          <InfoRow label="Payment Method" value={transaction.paymentMethod} />

          <InfoRow label="Amount" value={CURRENCY.format(transaction.amount)} />

          <InfoRow
            label="Remaining Balance"
            value={CURRENCY.format(transaction.newbalanceOrig)}
          />

          <InfoRow label="Transaction ID" value={transaction.transactionId} />

          <InfoRow
            label="Razorpay Order ID"
            value={receipt.razorpayOrderId ?? "Not Available"}
          />

          <InfoRow
            label="Razorpay Payment ID"
            value={receipt.razorpayPaymentId ?? "Not Available"}
          />

          <InfoRow
            label="Date & Time"
            value={DATE.format(new Date(transaction.createdAt))}
          />
        </div>

        {/* AI FRAUD ANALYSIS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3">
              <Shield className="text-green-600" size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold">AI Fraud Analysis</h2>

              <p className="text-sm text-slate-500">Generated by Sentinel AI</p>
            </div>
          </div>

          <InfoRow
            label="Prediction"
            value={prediction?.predictionLabel ?? "NOT AVAILABLE"}
          />

          <div className="flex items-center justify-between border-b py-4">
            <span className="text-slate-500">Risk Level</span>

            {prediction ? (
              <RiskBadge value={prediction.riskLevel} kind="risk" />
            ) : (
              <span>--</span>
            )}
          </div>

          <InfoRow
            label="Fraud Probability"
            value={`${((prediction?.fraudProbability ?? 0) * 100).toFixed(
              2,
            )} %`}
          />

          <InfoRow
            label="Confidence"
            value={`${((prediction?.confidence ?? 0) * 100).toFixed(2)} %`}
          />

          <InfoRow
            label="Model Version"
            value={prediction?.modelVersion ?? "--"}
          />

          <InfoRow
            label="Processing Time"
            value={
              prediction?.processingMs != null
                ? `${prediction.processingMs} ms`
                : "Not Available"
            }
          />

          <InfoRow
            label="Alert Created"
            value={prediction?.alertCreated ? "YES" : "NO"}
          />
        </div>
      </div>

      {/* AI SCORE */}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3">
            <Cpu className="text-purple-600" size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold">Sentinel AI Score</h2>

            <p className="text-sm text-slate-500">
              Overall transaction safety score
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex justify-between">
            <span className="font-medium">Safe Transaction</span>

            <span className="text-blue-600 font-bold">{score}/100</span>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-600"
              style={{
                width: `${score}%`,
              }}
            />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {score > 90
              ? "No suspicious activity detected. This transaction appears to be safe."
              : score > 60
                ? "Medium risk transaction. Additional verification may be required."
                : "High risk transaction detected by Sentinel AI."}
          </p>
        </div>
      </div>
      {/* PAYMENT TIMELINE */}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Payment Timeline</h2>

        <p className="mt-1 text-sm text-slate-500">
          End-to-end processing workflow
        </p>

        <div className="mt-8 space-y-6">
          <TimelineStep
            title="Transaction Created"
            subtitle="Payment request submitted"
          />

          <TimelineStep
            title="Razorpay Payment Successful"
            subtitle="Payment gateway processed successfully"
          />

          <TimelineStep
            title="AI Fraud Detection Completed"
            subtitle={
              prediction
                ? `Prediction: ${prediction.predictionLabel}`
                : "No prediction available"
            }
          />

          <TimelineStep
            title="Wallet Updated"
            subtitle={`Remaining Balance: ${CURRENCY.format(
              transaction.newbalanceOrig,
            )}`}
          />

          <TimelineStep
            title="Receipt Generated"
            subtitle="Digital receipt available for download"
          />
        </div>
      </div>

      {/* ACTION BUTTONS */}

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button icon={Download} onClick={() => downloadReceipt(receipt)}>
          Download Receipt
        </Button>

        <Button
          variant="secondary"
          icon={Printer}
          onClick={() => window.print()}
        >
          Print Receipt
        </Button>

        <Button variant="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------
   Helper Components
--------------------------------*/

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b py-4">
      <span className="text-slate-500">{label}</span>

      <span className="max-w-xs break-all text-right font-medium text-slate-800">
        {value ?? "--"}
      </span>
    </div>
  );
}

function TimelineStep({ title, subtitle }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 h-4 w-4 rounded-full bg-green-500" />

      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>

        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
