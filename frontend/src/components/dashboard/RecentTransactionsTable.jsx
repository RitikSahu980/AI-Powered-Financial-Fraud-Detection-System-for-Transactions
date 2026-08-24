import { useNavigate } from "react-router-dom";
import RiskBadge from "../ui/RiskBadge";

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const DATE = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Latest 5 of the user's transactions (see useDashboard - already sorted
 * newest-first server-side). "Status" shows predictionLabel, or "Pending"
 * when the per-transaction prediction lookup hasn't resolved - there's no
 * separate transaction-status field on the backend to show instead.
 */
export default function RecentTransactionsTable({ rows, isLoading }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-100 bg-surface shadow-card">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-semibold text-ink">Recent transactions</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Your 5 most recently submitted transactions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-medium">Transaction</th>
              <th className="px-5 py-2.5 font-medium text-right">Amount</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Risk</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3" colSpan={6}>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-sm text-slate-400"
                >
                  No transactions found.
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map(({ transaction: t, prediction: p }) => (
                <tr
                  key={t.transactionId}
                  onClick={() =>
                    navigate(`/admin/transactions/${t.transactionId}`)
                  }
                  className="cursor-pointer transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3 font-mono text-xs text-ink">
                    {t.transactionId}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums text-ink">
                    {CURRENCY.format(t.amount)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{t.type}</td>
                  <td className="px-5 py-3">
                    <RiskBadge value={p?.riskLevel} kind="risk" />
                    {!p && <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    {p ? (
                      <RiskBadge value={p.predictionLabel} kind="label" />
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                    {DATE.format(new Date(t.createdAt))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
