import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * A single summary metric tile for the dashboard's top row. `tone`
 * tints the icon chip so a glance at the row reads risk (red), attention
 * (amber), good (green) or neutral (azure) before the number is even read.
 */
const TONE_CLASSES = {
  neutral: 'bg-azure-50 text-azure',
  good: 'bg-risk-low-bg text-risk-low',
  warning: 'bg-risk-medium-bg text-risk-medium',
  danger: 'bg-risk-high-bg text-risk-high',
};

/**
 * `trend` is optional and only ever real, derived data (e.g. this-week
 * vs last-week counts from whatever sample was fetched) - never
 * fabricated. Omit the prop entirely when there isn't a meaningful
 * comparison to show, rather than rendering a placeholder trend.
 */
export default function StatCard({ label, value, icon: Icon, tone = 'neutral', caption, trend, isLoading = false }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <p className="font-display text-3xl font-semibold tabular-nums text-ink">{value}</p>
          {trend != null && trend !== 0 && (
            <span
              className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                trend > 0 ? 'bg-risk-low-bg text-risk-low' : 'bg-risk-high-bg text-risk-high'
              }`}
            >
              {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
      {caption && <p className="mt-1 text-xs text-slate-400">{caption}</p>}
    </div>
  );
}
