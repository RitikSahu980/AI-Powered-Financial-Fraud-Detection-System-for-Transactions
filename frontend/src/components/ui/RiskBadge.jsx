const RISK_STYLES = {
  LOW: 'bg-risk-low-bg text-risk-low',
  MEDIUM: 'bg-risk-medium-bg text-risk-medium',
  HIGH: 'bg-risk-high-bg text-risk-high',
};

const STATUS_STYLES = {
  OPEN: 'bg-risk-high-bg text-risk-high',
  RESOLVED: 'bg-risk-low-bg text-risk-low',
  DISMISSED: 'bg-slate-100 text-slate-500',
};

const LABEL_STYLES = {
  FRAUDULENT: 'bg-risk-high-bg text-risk-high',
  NOT_FRAUDULENT: 'bg-risk-low-bg text-risk-low',
};

/**
 * Small color-coded pill used for RiskLevel, AlertStatus, and
 * PredictionLabel values everywhere they appear in the app - one place
 * that owns the mapping from enum value to color, so risk semantics
 * (green/amber/red) stay consistent across every table and card.
 */
export default function RiskBadge({ value, kind = 'risk', size = 'sm' }) {
  if (!value) return null;
  const styles = kind === 'status' ? STATUS_STYLES : kind === 'label' ? LABEL_STYLES : RISK_STYLES;
  const className = styles[value] ?? 'bg-slate-100 text-slate-500';
  const display = String(value).replace(/_/g, ' ');
  const sizeClasses = size === 'lg' ? 'px-4 py-1.5 text-sm tracking-wide' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${className}`}>
      {display}
    </span>
  );
}
