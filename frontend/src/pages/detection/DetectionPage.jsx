import { useState } from 'react';
import TransactionForm from '../../components/detection/TransactionForm';
import PredictionCard from '../../components/detection/PredictionCard';
import { createTransaction } from '../../services/transactionService';
import { normalizeApiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

/**
 * Submits a transaction to POST /api/v1/transactions and shows the real
 * PredictionResponse the backend returns - persistence, ML call, risk
 * derivation, and alert creation all happen server-side (Module 6/7);
 * this page only sends the form and renders what comes back.
 */
export default function DetectionPage() {
  const toast = useToast();
  const [prediction, setPrediction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  async function handleSubmit(payload) {
    setIsSubmitting(true);
    setServerErrors({});
    try {
      const result = await createTransaction(payload);
      setPrediction(result);
      toast.success('Transaction analyzed.');
    } catch (err) {
      const normalized = normalizeApiError(err);
      if (normalized.isValidationError) {
        const fieldErrors = {};
        normalized.fieldErrors.forEach((fe) => {
          fieldErrors[fe.field] = fe.message;
        });
        setServerErrors(fieldErrors);
        toast.error('Please correct the highlighted fields.');
      } else if (normalized.status === 503) {
        toast.error('The fraud detection service is temporarily unavailable. Try again shortly.');
      } else {
        toast.error(normalized.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold text-ink">Fraud Detection</h1>
        <p className="mt-1 text-sm text-slate-500">
          Analyst testing tool - manually submit transaction features to inspect the model's behavior directly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-card">
          <TransactionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} serverErrors={serverErrors} />
        </div>

        <PredictionCard prediction={prediction} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
