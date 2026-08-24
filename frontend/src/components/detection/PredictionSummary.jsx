import { Hash, Cpu, Timer, ShieldCheck } from 'lucide-react';

function Row({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={15} className="text-slate-400" />
        {label}
      </span>
      <span className={`text-sm font-medium text-ink ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

/**
 * Metadata rows drawn straight from PredictionResponse. "Processing time"
 * uses `processingMs` (time the ML service took) rather than a wall-clock
 * timestamp - PredictionResponse has no created-at field, so there's
 * nothing else honest to show there.
 */
export default function PredictionSummary({ prediction }) {
  return (
    <div className="divide-y divide-slate-50">
      <Row icon={Hash} label="Transaction ID" value={prediction.transactionId} mono />
      <Row icon={Cpu} label="Model Version" value={prediction.modelVersion} mono />
      <Row
        icon={Timer}
        label="Processing Time"
        value={prediction.processingMs != null ? `${prediction.processingMs} ms` : '—'}
      />
      <Row
        icon={ShieldCheck}
        label="Alert Created"
        value={prediction.alertCreated ? 'Yes' : 'No'}
      />
    </div>
  );
}
