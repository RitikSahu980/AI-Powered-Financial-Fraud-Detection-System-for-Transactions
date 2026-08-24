import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { LOW: '#16A34A', MEDIUM: '#D97706', HIGH: '#DC2626' };

/**
 * Distribution of riskLevel across the predictions currently loaded on
 * this page - explicitly labeled "this page" rather than "all-time",
 * since there's no backend aggregation endpoint yet and computing a true
 * global distribution would mean paging through every prediction. Honest
 * about its own scope rather than presenting a partial sample as a total.
 */
export default function RiskDistributionChart({ predictions, isLoading }) {
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  predictions.forEach((p) => {
    if (p.riskLevel && counts[p.riskLevel] !== undefined) counts[p.riskLevel] += 1;
  });
  const data = Object.entries(counts)
    .map(([riskLevel, count]) => ({ riskLevel, count }))
    .filter((d) => d.count > 0);

  return (
    <div className="rounded-2xl border border-slate-100 bg-surface p-5 shadow-card">
      <p className="text-sm font-semibold text-ink">Risk distribution</p>
      <p className="mt-0.5 text-xs text-slate-400">Across the {predictions.length} most recent predictions</p>

      {isLoading ? (
        <div className="mt-6 flex h-44 items-center justify-center">
          <div className="h-32 w-32 animate-pulse rounded-full bg-slate-100" />
        </div>
      ) : data.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">No predictions yet.</p>
      ) : (
        <>
          <div className="mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="riskLevel" innerRadius={48} outerRadius={70} paddingAngle={3}>
                  {data.map((entry) => (
                    <Cell key={entry.riskLevel} fill={COLORS[entry.riskLevel]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #EAEEF4', fontSize: 12.5 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-center gap-4">
            {data.map((d) => (
              <div key={d.riskLevel} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[d.riskLevel] }} />
                {d.riskLevel} ({d.count})
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
