import { useState } from 'react';
import { Check, X } from 'lucide-react';
import Button from '../ui/Button';
import RiskBadge from '../ui/RiskBadge';
import { resolveAlert, dismissAlert } from '../../services/alertService';
import { normalizeApiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const RELATIVE = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

function relativeTime(isoString) {
  const diffMs = new Date(isoString).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  if (Math.abs(diffMin) < 60) return RELATIVE.format(diffMin, 'minute');
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return RELATIVE.format(diffHr, 'hour');
  return RELATIVE.format(Math.round(diffHr / 24), 'day');
}

/**
 * Open fraud alerts, from GET /api/v1/alerts/open (Module 7). Resolve /
 * dismiss call the real PUT endpoints and remove the alert from the list
 * on success - no optimistic fake state, the list reflects what the
 * backend actually persisted.
 */
export default function OpenAlertsPanel({ alerts, isLoading, onAlertClosed }) {
  const toast = useToast();
  const [pendingId, setPendingId] = useState(null);

  async function handleAction(alert, action) {
    setPendingId(alert.alertId);
    try {
      if (action === 'resolve') {
        await resolveAlert(alert.alertId);
        toast.success(`${alert.alertId} marked resolved.`);
        onAlertClosed(alert.alertId, { ...alert, alertStatus: 'RESOLVED', resolvedAt: new Date().toISOString() });
      } else {
        await dismissAlert(alert.alertId);
        toast.info(`${alert.alertId} dismissed.`);
        onAlertClosed(alert.alertId, { ...alert, alertStatus: 'DISMISSED', resolvedAt: new Date().toISOString() });
      }
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-surface shadow-card">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-semibold text-ink">Open alerts</p>
        <p className="mt-0.5 text-xs text-slate-400">Cases waiting on an analyst decision</p>
      </div>

      <div className="max-h-[420px] divide-y divide-slate-50 overflow-y-auto">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            </div>
          ))}

        {!isLoading && alerts.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No open alerts. Nothing needs review.</p>
        )}

        {!isLoading &&
          alerts.map((alert) => (
            <div key={alert.alertId} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-ink">{alert.alertId}</span>
                    <RiskBadge value={alert.alertType === 'HIGH_RISK_TRANSACTION' ? 'HIGH' : 'MEDIUM'} kind="risk" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Transaction {alert.transactionId} &middot; {relativeTime(alert.createdAt)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Check}
                  isLoading={pendingId === alert.alertId}
                  onClick={() => handleAction(alert, 'resolve')}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={X}
                  isLoading={pendingId === alert.alertId}
                  onClick={() => handleAction(alert, 'dismiss')}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
