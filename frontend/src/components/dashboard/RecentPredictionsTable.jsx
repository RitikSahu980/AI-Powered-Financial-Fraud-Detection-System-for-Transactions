import RiskBadge from '../ui/RiskBadge';

const PERCENT = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Recent fraud predictions, from GET /api/v1/predictions (Module 7).
 * transactionId is the row's identifier throughout, since
 * PredictionResponse carries no timestamp to label rows by time - see
 * predictionService.js for why "recent" means predictionId-desc.
 */
export default function RecentPredictionsTable({ predictions, isLoading }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-surface shadow-card">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-semibold text-ink">Recent predictions</p>
        <p className="mt-0.5 text-xs text-slate-400">Latest fraud scoring results across all transactions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-medium">Transaction</th>
              <th className="px-5 py-2.5 font-medium">Result</th>
              <th className="px-5 py-2.5 font-medium">Risk</th>
              <th className="px-5 py-2.5 font-medium">Probability</th>
              <th className="px-5 py-2.5 font-medium">Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3" colSpan={5}>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && predictions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                  No predictions yet. They'll appear here once transactions are scored.
                </td>
              </tr>
            )}

            {!isLoading &&
              predictions.map((p) => (
                <tr key={p.transactionId} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-mono text-xs text-ink">{p.transactionId}</td>
                  <td className="px-5 py-3">
                    <RiskBadge value={p.predictionLabel} kind="label" />
                  </td>
                  <td className="px-5 py-3">
                    <RiskBadge value={p.riskLevel} kind="risk" />
                  </td>
                  <td className="px-5 py-3 tabular-nums text-slate-600">
                    {p.fraudProbability != null ? PERCENT.format(p.fraudProbability) : '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{p.modelVersion}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
