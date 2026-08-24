import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/transactions/SearchBar';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import TransactionsTable from '../../components/transactions/TransactionsTable';
import Pagination from '../../components/ui/Pagination';
import { getTransactionsByUser } from '../../services/transactionService';
import { getPredictionByTransactionId } from '../../services/predictionService';
import { normalizeApiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/csvExport';

const DEFAULT_FILTERS = {
  type: 'ALL',
  riskLevel: 'ALL',
  prediction: 'ALL',
  minAmount: '',
  maxAmount: '',
  startDate: '',
  endDate: '',
};

/**
 * Shows the current user's transaction history - the widest slice this
 * backend supports (see transactionService.getTransactionsByUser; there's
 * no all-users endpoint). Page/size/date-sort are real server-side
 * pagination and sorting; search, the four filters, and risk-sort apply
 * client-side to whatever page is currently loaded.
 */
export default function TransactionsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState('createdAt,desc');
  const [transactionPage, setTransactionPage] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [predictionsByTxnId, setPredictionsByTxnId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const serverSort = sort.startsWith('risk') ? 'createdAt,desc' : sort;

  const loadPage = useCallback(async () => {
    if (!user?.userId) return;
    setIsLoading(true);
    try {
      const result = await getTransactionsByUser(user.userId, { page, size: pageSize, sort: serverSort });
      setTransactionPage(result);

      const predictionResults = await Promise.allSettled(
        result.content.map((t) => getPredictionByTransactionId(t.transactionId))
      );
      const map = {};
      result.content.forEach((t, i) => {
        const outcome = predictionResults[i];
        if (outcome.status === 'fulfilled') map[t.transactionId] = outcome.value;
      });
      setPredictionsByTxnId(map);
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, page, pageSize, serverSort]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const rows = useMemo(() => {
    let joined = transactionPage.content.map((transaction) => ({
      transaction,
      prediction: predictionsByTxnId[transaction.transactionId] ?? null,
    }));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      joined = joined.filter(
        ({ transaction: t }) =>
          t.transactionId.toLowerCase().includes(q) ||
          t.nameOrig.toLowerCase().includes(q) ||
          t.nameDest.toLowerCase().includes(q)
      );
    }
    if (filters.type !== 'ALL') joined = joined.filter(({ transaction: t }) => t.type === filters.type);
    if (filters.riskLevel !== 'ALL') joined = joined.filter(({ prediction: p }) => p?.riskLevel === filters.riskLevel);
    if (filters.prediction !== 'ALL')
      joined = joined.filter(({ prediction: p }) => p?.predictionLabel === filters.prediction);
    if (filters.minAmount !== '') joined = joined.filter(({ transaction: t }) => t.amount >= Number(filters.minAmount));
    if (filters.maxAmount !== '') joined = joined.filter(({ transaction: t }) => t.amount <= Number(filters.maxAmount));
    if (filters.startDate) joined = joined.filter(({ transaction: t }) => new Date(t.createdAt) >= new Date(filters.startDate));
    if (filters.endDate) joined = joined.filter(({ transaction: t }) => new Date(t.createdAt) <= new Date(filters.endDate + 'T23:59:59'));

    if (sort === 'risk,desc' || sort === 'risk,asc') {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1, undefined: 0 };
      joined = [...joined].sort((a, b) => {
        const diff = (order[a.prediction?.riskLevel] ?? 0) - (order[b.prediction?.riskLevel] ?? 0);
        return sort === 'risk,desc' ? -diff : diff;
      });
    }

    return joined;
  }, [transactionPage.content, predictionsByTxnId, search, filters, sort]);

  function handleExportCsv() {
    if (rows.length === 0) {
      toast.info('Nothing to export on this page.');
      return;
    }
    const flat = rows.map(({ transaction: t, prediction: p }) => ({
      transactionId: t.transactionId,
      type: t.type,
      amount: t.amount,
      nameOrig: t.nameOrig,
      nameDest: t.nameDest,
      predictionLabel: p?.predictionLabel ?? '',
      riskLevel: p?.riskLevel ?? '',
      confidence: p?.confidence ?? '',
      fraudProbability: p?.fraudProbability ?? '',
      createdAt: t.createdAt,
    }));
    exportToCsv(`transactions-page-${page + 1}.csv`, flat);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Transaction History</h1>
          <p className="mt-1 text-sm text-slate-500">Every transaction you've submitted for fraud analysis.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadPage} isLoading={isLoading}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <TransactionFilters filters={filters} onChange={setFilters} sort={sort} onSortChange={setSort} />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-surface shadow-card">
        <TransactionsTable rows={rows} isLoading={isLoading} onAnalyzeFirst={() => navigate('/admin/detection')} />
        {!isLoading && transactionPage.totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={transactionPage.totalPages}
            pageSize={pageSize}
            totalElements={transactionPage.totalElements}
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
