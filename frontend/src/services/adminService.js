const STORAGE_KEY = 'admin:resolvedAlertsThisSession';

/**
 * AlertController only exposes GET /alerts/open - there's no endpoint to
 * list alerts that are RESOLVED or DISMISSED. So the Admin Alerts page's
 * "Resolved" tab can only show alerts resolved/dismissed *through this
 * app, in this browser* - tracked here in localStorage - not a true
 * history of every resolved alert ever. The Alerts page labels the tab
 * accordingly ("Resolved this session") rather than implying it's complete.
 */
export function recordResolvedAlert(alert) {
  const existing = getResolvedAlertsThisSession();
  const next = [alert, ...existing.filter((a) => a.alertId !== alert.alertId)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 100)));
}

export function getResolvedAlertsThisSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}
