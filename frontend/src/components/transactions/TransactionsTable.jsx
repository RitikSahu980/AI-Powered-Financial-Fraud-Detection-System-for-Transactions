import TransactionRow from './TransactionRow';
import EmptyState from '../ui/EmptyState';
import { Receipt } from 'lucide-react';

const COLUMNS = [
  'Transaction ID', 'Type', 'Amount', 'Prediction', 'Risk Level', 'Confidence', 'Fraud Probability', 'Created', 'Actions',
];

function SkeletonRows({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i}>
          <td colSpan={COLUMNS.length} className="px-5 py-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

function SkeletonCards({ count = 4 }) {
  return (
    <div className="space-y-3 md:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-100 bg-slate-50" />
      ))}
    </div>
  );
}

/**
 * `rows` are transactions already joined with their prediction (or null,
 * if that lookup hasn't resolved) - see TransactionsPage for how the join
 * happens and why it's client-side (no backend endpoint returns both
 * together).
 */
export default function TransactionsTable({ rows, isLoading, onAnalyzeFirst }) {
  if (!isLoading && rows.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions analysed yet."
        description="Submit a transaction for fraud scoring to see it show up here."
        actionLabel="Analyze First Transaction"
        onAction={onAnalyzeFirst}
      />
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              {COLUMNS.map((c) => (
                <th key={c} className={`px-5 py-2.5 font-medium ${c === 'Amount' ? 'text-right' : ''}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <SkeletonRows />
            ) : (
              rows.map(({ transaction, prediction }) => (
                <TransactionRow key={transaction.transactionId} transaction={transaction} prediction={prediction} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      {isLoading ? (
        <SkeletonCards />
      ) : (
        <div className="space-y-3 md:hidden">
          {rows.map(({ transaction, prediction }) => (
            <TransactionRow key={transaction.transactionId} transaction={transaction} prediction={prediction} isMobile />
          ))}
        </div>
      )}
    </>
  );
}
