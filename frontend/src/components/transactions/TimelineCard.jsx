import { CircleCheck, Radar, TriangleAlert, Send } from 'lucide-react';

const DATETIME = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'medium' });

/**
 * Only `Transaction Submitted` has a real timestamp (transaction.createdAt).
 * "ML Processing Started" and "Prediction Completed" are derived from
 * `createdAt` + `processingMs` (the ML service's own reported duration) -
 * the backend records no separate timestamp for either stage, so these
 * two are labeled "estimated" rather than presented as exact. "Alert
 * Generated" uses the same estimated instant, since alert creation
 * happens synchronously right after the prediction in the same request
 * and there's no dedicated alert-lookup-by-transaction endpoint to fetch
 * its real createdAt.
 */
export default function TimelineCard({ transaction, prediction }) {
  const submittedAt = new Date(transaction.createdAt);
  const processingMs = prediction?.processingMs ?? 0;
  const predictedAt = new Date(submittedAt.getTime() + processingMs);

  const steps = [
    {
      icon: Send,
      title: 'Transaction Submitted',
      time: DATETIME.format(submittedAt),
      estimated: false,
    },
    {
      icon: Radar,
      title: 'ML Processing Started',
      time: DATETIME.format(submittedAt),
      estimated: true,
    },
    {
      icon: CircleCheck,
      title: 'Prediction Completed',
      time: prediction ? `${DATETIME.format(predictedAt)} (${processingMs} ms)` : 'Pending',
      estimated: true,
    },
  ];

  if (prediction?.alertCreated) {
    steps.push({
      icon: TriangleAlert,
      title: 'Alert Generated',
      time: DATETIME.format(predictedAt),
      estimated: true,
      danger: true,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold text-ink">Timeline</p>
      {steps.some((s) => s.estimated) && (
        <p className="mt-0.5 text-xs text-slate-400">Times marked "estimated" are derived, not recorded directly.</p>
      )}
      <ol className="mt-4 space-y-5">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-3 pl-1">
            {i < steps.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-slate-100" aria-hidden="true" />
            )}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                step.danger ? 'bg-risk-high-bg text-risk-high' : 'bg-azure-50 text-azure'
              }`}
            >
              <step.icon size={15} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                {step.title}
                {step.estimated && <span className="ml-1.5 text-[10px] font-normal text-slate-400">(estimated)</span>}
              </p>
              <p className="text-xs text-slate-400">{step.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
