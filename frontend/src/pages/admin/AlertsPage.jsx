import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import RiskBadge from '../../components/ui/RiskBadge';
import EmptyState from '../../components/ui/EmptyState';
import OpenAlertsPanel from '../../components/dashboard/OpenAlertsPanel';
import { getOpenAlerts } from '../../services/alertService';
import { recordResolvedAlert, getResolvedAlertsThisSession } from '../../services/adminService';
import { normalizeApiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const RELATIVE = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
function relativeTime(iso) {
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(diffMin) < 60) return RELATIVE.format(diffMin, 'minute');
  return RELATIVE.format(Math.round(diffMin / 60), 'hour');
}

const TABS = [
  { key: 'open', label: 'Open Alerts' },
  { key: 'resolved', label: 'Resolved (this session)' },
];

/**
 * AlertController only exposes GET /alerts/open - see adminService.js for
 * why the Resolved tab is scoped to "resolved through this app, this
 * browser session" rather than a true historical list. That distinction
 * is shown in the tab label itself, not just buried in a comment.
 */
export default function AlertsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('open');
  const [openAlerts, setOpenAlerts] = useState([]);
  const [isLoadingOpen, setIsLoadingOpen] = useState(true);
  const [resolvedAlerts, setResolvedAlerts] = useState(getResolvedAlertsThisSession());

  useEffect(() => {
    loadOpen();
  }, []);

  async function loadOpen() {
    setIsLoadingOpen(true);
    try {
      setOpenAlerts(await getOpenAlerts());
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setIsLoadingOpen(false);
    }
  }

  function handleAlertClosed(alertId, closedAlert) {
    setOpenAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
    recordResolvedAlert(closedAlert);
    setResolvedAlerts(getResolvedAlertsThisSession());
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Alerts</h1>
        <p className="mt-1 text-sm text-slate-500">Fraud cases waiting on, or already given, an analyst decision.</p>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.key ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'open' && <OpenAlertsPanel alerts={openAlerts} isLoading={isLoadingOpen} onAlertClosed={handleAlertClosed} />}

      {tab === 'resolved' &&
        (resolvedAlerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Nothing resolved yet this session"
            description="Alerts you resolve or dismiss on the Open tab will show up here until you close this browser tab."
          />
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-surface shadow-card">
            <div className="divide-y divide-slate-50">
              {resolvedAlerts.map((alert) => (
                <div key={alert.alertId} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-ink">{alert.alertId}</span>
                      <RiskBadge value={alert.alertStatus} kind="status" />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">Transaction {alert.transactionId}</p>
                  </div>
                  <span className="text-xs text-slate-400">{relativeTime(alert.resolvedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
