import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DAY_LABEL = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/**
 * Daily transaction count, bucketed client-side from the same recent
 * transaction sample the rest of the dashboard uses (see
 * dashboardService.js) - there's no backend time-series/aggregation
 * endpoint, so this reflects your last N transactions' dates, not a
 * guaranteed full history.
 */
export default function TransactionTrendChart({ trendData, isLoading }) {
  const data = trendData.map((d) => ({ ...d, label: DAY_LABEL.format(new Date(d.date)) }));

  return (
    <div className="rounded-2xl border border-slate-100 bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-ink">Transaction trend</p>
      <p className="mt-0.5 text-xs text-slate-400">Your transactions per day, most recent activity</p>

      {isLoading ? (
        <div className="mt-4 h-52 animate-pulse rounded-xl bg-slate-100" />
      ) : data.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">No transactions yet.</p>
      ) : (
        <div className="mt-3 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEEF4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5B6B85' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5B6B85' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [`${value}`, 'Transactions']}
                contentStyle={{ borderRadius: 10, border: '1px solid #EAEEF4', fontSize: 12.5 }}
              />
              <Line type="monotone" dataKey="count" stroke="#2F6FED" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
