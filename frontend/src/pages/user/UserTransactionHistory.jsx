import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Pagination from "../../components/ui/Pagination";
import PaymentStatusBadge from "../../components/user/PaymentStatusBadge";
import { getTransactionsByUser } from "../../services/transactionService";
import { getPredictionByTransactionId } from "../../services/predictionService";
import { paymentOutcome } from "../../services/paymentService";
import { normalizeApiError } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const DATE = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});
const STATUS_OPTIONS = ["ALL", "SUCCESSFUL", "UNDER_REVIEW", "BLOCKED"];
const STATUS_LABELS = {
  ALL: "All",
  SUCCESSFUL: "Successful",
  UNDER_REVIEW: "Under Review",
  BLOCKED: "Blocked",
};

export default function UserTransactionHistory() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [transactionPage, setTransactionPage] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
  });
  const [predictionsByTxnId, setPredictionsByTxnId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setIsLoading(true);
    try {
      const result = await getTransactionsByUser(user.userId, {
        page,
        size: pageSize,
        sort: "createdAt,desc",
      });
      setTransactionPage(result);
      const outcomes = await Promise.allSettled(
        result.content.map((t) =>
          getPredictionByTransactionId(t.transactionId),
        ),
      );
      const map = {};
      result.content.forEach((t, i) => {
        if (outcomes[i].status === "fulfilled")
          map[t.transactionId] = outcomes[i].value;
      });
      setPredictionsByTxnId(map);
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    let joined = transactionPage.content.map((t) => ({
      transaction: t,
      prediction: predictionsByTxnId[t.transactionId] ?? null,
    }));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      joined = joined.filter(
        ({ transaction: t }) =>
          t.nameDest.toLowerCase().includes(q) ||
          t.transactionId.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "ALL") {
      joined = joined.filter(
        ({ prediction: p }) => p && paymentOutcome(p) === statusFilter,
      );
    }
    return joined;
  }, [transactionPage.content, predictionsByTxnId, search, statusFilter]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Transaction History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every payment you've made, with its outcome.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient or reference…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/15"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink focus:border-azure focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2.5 font-medium text-right">Amount</th>
                <th className="px-5 py-2.5 font-medium">Recipient</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Reference</th>

                <th className="px-5 py-2.5 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No transactions found
                  </td>
                </tr>
              )}

              {!isLoading &&
                rows.map(({ transaction: t, prediction }) => (
                  <tr
                    key={t.transactionId}
                    onClick={() => navigate(`/user/history/${t.transactionId}`)}
                    className="cursor-pointer transition-colors hover:bg-blue-50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums text-ink">
                      {CURRENCY.format(t.amount)}
                    </td>
                    <td className="px-5 py-3 text-ink">{t.nameDest}</td>
                    <td className="px-5 py-3">
                      <PaymentStatusBadge prediction={prediction} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      {DATE.format(new Date(t.createdAt))}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-400">
                      {t.transactionId}
                    </td>

                    <td className="px-5 py-3 text-center">
                      <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        View Details →
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

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
