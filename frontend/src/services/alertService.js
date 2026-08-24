import api from '../api/axios';

/** Fetches every alert currently in OPEN status. Real, working endpoint. */
export async function getOpenAlerts() {
  const response = await api.get('/alerts/open');
  return response.data.data;
}

/**
 * Marks an alert RESOLVED. Real, working endpoint. `notes` is a query
 * param on the backend (`@RequestParam(required = false) String notes`),
 * not a request body - so it's sent as `params`, with no body at all.
 */
export async function resolveAlert(alertId, notes) {
  const response = await api.put(`/alerts/${alertId}/resolve`, null, {
    params: notes ? { notes } : undefined,
  });
  return response.data.data;
}

/** Marks an alert DISMISSED. Real, working endpoint. Same query-param shape as resolveAlert. */
export async function dismissAlert(alertId, notes) {
  const response = await api.put(`/alerts/${alertId}/dismiss`, null, {
    params: notes ? { notes } : undefined,
  });
  return response.data.data;
}
