import { paymentOutcome } from '../../services/paymentService';

const STYLES = {
  SUCCESSFUL: 'bg-risk-low-bg text-risk-low',
  UNDER_REVIEW: 'bg-risk-medium-bg text-risk-medium',
  BLOCKED: 'bg-risk-high-bg text-risk-high',
  PENDING: 'bg-slate-100 text-slate-500',
};

const LABELS = {
  SUCCESSFUL: 'Successful',
  UNDER_REVIEW: 'Under Review',
  BLOCKED: 'Blocked',
  PENDING: 'Processing',
};

/**
 * Deliberately never shows riskLevel, fraudProbability, or confidence -
 * the brief is explicit that those are backend/analyst concerns, not
 * something a personal-banking user sees. `prediction` may be null while
 * the per-transaction lookup hasn't resolved yet, shown as "Processing."
 */
export default function PaymentStatusBadge({ prediction }) {
  const status = prediction ? paymentOutcome(prediction) : 'PENDING';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
