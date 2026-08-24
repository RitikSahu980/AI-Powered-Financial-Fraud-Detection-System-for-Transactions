import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import RiskBadge from "../ui/RiskBadge";

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const PERCENT = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const DATE = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * `prediction` is null when the per-transaction prediction lookup
 * (GET /predictions/transaction/{id}) hasn't resolved yet or failed -
 * rendered as "—" rather than hidden, so the row doesn't silently shift.
 */
export default function TransactionRow({ transaction, prediction, isMobile }) {
  const t = transaction;

  if (isMobile) {
    return (
      <Link
        to={`/admin/transactions/${t.transactionId}`}
        className="block rounded-xl border border-slate-100 bg-surface p-4 shadow-card transition hover:border-azure/30"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium text-ink">
            {t.transactionId}
          </span>
          <RiskBadge value={prediction?.riskLevel} kind="risk" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-slate-500">{t.type}</span>
          <span className="font-display text-base font-semibold text-ink">
            {CURRENCY.format(t.amount)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{DATE.format(new Date(t.createdAt))}</span>
          {prediction && (
            <RiskBadge value={prediction.predictionLabel} kind="label" />
          )}
        </div>
      </Link>
    );
  }

  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink">
        {t.transactionId}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-slate-600">{t.type}</td>
      <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums text-ink">
        {CURRENCY.format(t.amount)}
      </td>
      <td className="whitespace-nowrap px-5 py-3">
        <RiskBadge value={prediction?.predictionLabel} kind="label" />
        {!prediction && <span className="text-xs text-slate-300">—</span>}
      </td>
      <td className="whitespace-nowrap px-5 py-3">
        <RiskBadge value={prediction?.riskLevel} kind="risk" />
        {!prediction && <span className="text-xs text-slate-300">—</span>}
      </td>
      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
        {prediction?.confidence != null
          ? PERCENT.format(prediction.confidence)
          : "—"}
      </td>
      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
        {prediction?.fraudProbability != null
          ? PERCENT.format(prediction.fraudProbability)
          : "—"}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-slate-500">
        {DATE.format(new Date(t.createdAt))}
      </td>
      <td className="whitespace-nowrap px-5 py-3">
        <Link
          to={`/admin/transactions/${t.transactionId}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-azure transition hover:bg-azure-50"
        >
          <Eye size={14} /> View
        </Link>
      </td>
    </tr>
  );
}
