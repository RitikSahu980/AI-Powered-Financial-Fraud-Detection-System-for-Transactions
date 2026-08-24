import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getTransaction } from '../../services/transactionService';
import { getPredictionByTransactionId } from '../../services/predictionService';
import { normalizeApiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import TransactionSummaryCard from '../../components/transactions/TransactionSummaryCard';
import TimelineCard from '../../components/transactions/TimelineCard';
import PredictionCard from '../../components/detection/PredictionCard';

/**
 * Fetches the real transaction (GET /transactions/{id}) and its real
 * prediction (GET /predictions/transaction/{id}) - two separate calls,
 * since the backend has no single endpoint returning both joined.
 */
export default function TransactionDetails() {
  const { transactionId } = useParams();
  const toast = useToast();

  const [transaction, setTransaction] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setNotFound(false);
      try {
        const t = await getTransaction(transactionId);
        if (cancelled) return;
        setTransaction(t);

        try {
          const p = await getPredictionByTransactionId(transactionId);
          if (!cancelled) setPrediction(p);
        } catch {
          // A transaction can exist without a resolvable prediction lookup
          // failing shouldn't block the rest of the page - just leave
          // the prediction section showing "No analysis yet".
        }
      } catch (err) {
        if (cancelled) return;
        const normalized = normalizeApiError(err);
        if (normalized.status === 404) {
          setNotFound(true);
        } else {
          toast.error(normalized.message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-lg font-semibold text-ink">Transaction not found</p>
        <p className="mt-1 text-sm text-slate-500">No transaction exists with ID {transactionId}.</p>
        <Link to="/admin/transactions" className="mt-5 inline-block text-sm font-medium text-azure hover:underline">
          Back to Transaction History
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link
        to="/admin/transactions"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to Transaction History
      </Link>

      {isLoading && !transaction ? (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      ) : transaction ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <TransactionSummaryCard transaction={transaction} />
            <TimelineCard transaction={transaction} prediction={prediction} />
          </div>
          <PredictionCard
            prediction={prediction}
            isSubmitting={false}
            emptyTitle="No prediction found"
            emptyDescription="This transaction doesn't have a resolvable fraud prediction."
          />
        </div>
      ) : null}
    </div>
  );
}
