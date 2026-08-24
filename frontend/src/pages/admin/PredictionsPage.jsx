import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Radar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import RiskBadge from '../../components/ui/RiskBadge';
import { getPredictionHistory } from '../../services/predictionService';
import { normalizeApiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const PERCENT = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Every prediction the platform has made - real, working GET /predictions, same endpoint the Dashboard samples from. */
export default function PredictionsPage() {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPredictionHistory({ page, size: pageSize, sort: 'predictionId,desc' });
      setData(result);
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Predictions</h1>
          <p className="mt-1 text-sm text-slate-500">Every fraud prediction the model has produced, platform-wide.</p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load} isLoading={isLoading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-surface shadow-card">
        {!isLoading && data.content.length === 0 ? (
          <EmptyState icon={Radar} title="No predictions yet." description="Predictions appear here once transactions are scored." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5 font-medium">Prediction ID</th>
                  <th className="px-5 py-2.5 font-medium">Transaction</th>
                  <th className="px-5 py-2.5 font-medium">Result</th>
                  <th className="px-5 py-2.5 font-medium">Risk</th>
                  <th className="px-5 py-2.5 font-medium">Confidence</th>
                  <th className="px-5 py-2.5 font-medium">Probability</th>
                  <th className="px-5 py-2.5 font-medium">Model</th>
                  <th className="px-5 py-2.5 font-medium">Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-5 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))}
                {!isLoading &&
                  data.content.map((p) => (
                    <tr key={p.predictionId} className="hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-ink">{p.predictionId}</td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-500">{p.transactionId}</td>
                      <td className="px-5 py-3">
                        <RiskBadge value={p.predictionLabel} kind="label" />
                      </td>
                      <td className="px-5 py-3">
                        <RiskBadge value={p.riskLevel} kind="risk" />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
                        {p.confidence != null ? PERCENT.format(p.confidence) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-600">
                        {p.fraudProbability != null ? PERCENT.format(p.fraudProbability) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-400">{p.modelVersion}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">{p.alertCreated ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && data.totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            pageSize={pageSize}
            totalElements={data.totalElements}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        )}
      </div>
    </div>
  );
}
