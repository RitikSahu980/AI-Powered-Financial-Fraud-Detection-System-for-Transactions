import { ShieldAlert, ShieldCheck, ShieldQuestion, TriangleAlert } from 'lucide-react';
import RiskBadge from '../ui/RiskBadge';
import LoadingOverlay from '../ui/LoadingOverlay';
import ConfidenceGauge from './ConfidenceGauge';
import ProbabilityBar from './ProbabilityBar';
import PredictionSummary from './PredictionSummary';

const RISK_ICON = { HIGH: ShieldAlert, MEDIUM: ShieldQuestion, LOW: ShieldCheck };

/**
 * The result panel for a submitted transaction - every value comes
 * directly from PredictionResponse (see transactionService.js), nothing
 * computed or invented here beyond the two animated presentations of
 * numbers the backend already returned.
 */
export default function PredictionCard({
  prediction,
  isSubmitting,
  emptyTitle = 'No analysis yet',
  emptyDescription = 'Fill in the transaction on the left and submit it to see the fraud prediction here.',
}) {
  const RiskIcon = prediction ? RISK_ICON[prediction.riskLevel] ?? ShieldQuestion : ShieldQuestion;

  return (
    <div className="relative rounded-2xl border border-slate-100 bg-surface p-6 shadow-card">
      {isSubmitting && <LoadingOverlay />}

      {!prediction && !isSubmitting && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50">
            <ShieldQuestion size={26} className="text-azure" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink">{emptyTitle}</p>
          <p className="mt-1 max-w-xs text-sm text-slate-400">{emptyDescription}</p>
        </div>
      )}

      {prediction && (
        <div className="animate-fade-in-up">
          <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-6 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                prediction.riskLevel === 'HIGH'
                  ? 'bg-risk-high-bg'
                  : prediction.riskLevel === 'MEDIUM'
                    ? 'bg-risk-medium-bg'
                    : 'bg-risk-low-bg'
              }`}
            >
              <RiskIcon
                size={28}
                className={
                  prediction.riskLevel === 'HIGH'
                    ? 'text-risk-high'
                    : prediction.riskLevel === 'MEDIUM'
                      ? 'text-risk-medium'
                      : 'text-risk-low'
                }
              />
            </div>
            <RiskBadge value={prediction.riskLevel} kind="risk" size="lg" />
            <RiskBadge value={prediction.predictionLabel} kind="label" />
          </div>

          {prediction.alertCreated && (
            <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-risk-high/25 bg-risk-high-bg px-4 py-3">
              <TriangleAlert size={18} className="shrink-0 text-risk-high" />
              <p className="text-sm font-medium text-risk-high">High Risk Alert Generated</p>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-around">
            <ConfidenceGauge confidence={prediction.confidence} riskLevel={prediction.riskLevel} />
            <div className="w-full sm:max-w-[220px] sm:pt-6">
              <ProbabilityBar probability={prediction.fraudProbability} riskLevel={prediction.riskLevel} />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100">
            <PredictionSummary prediction={prediction} />
          </div>
        </div>
      )}
    </div>
  );
}
