const TYPES = ['ALL', 'PAYMENT', 'TRANSFER', 'CASH_OUT', 'DEBIT', 'CASH_IN'];
const RISK_LEVELS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
const PREDICTIONS = ['ALL', 'FRAUDULENT', 'NOT_FRAUDULENT'];

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'createdAt,asc', label: 'Oldest First' },
  { value: 'amount,desc', label: 'Highest Amount' },
  { value: 'amount,asc', label: 'Lowest Amount' },
  // Risk isn't a field on the Transaction document (it lives on the
  // joined prediction), so these two sort client-side, within the
  // currently loaded page only - not a real server-side sort like the
  // four above.
  { value: 'risk,desc', label: 'Highest Risk (this page)' },
  { value: 'risk,asc', label: 'Lowest Risk (this page)' },
];

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-ink focus:border-azure focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Type/Risk/Prediction/Amount filters apply client-side to the currently
 * loaded page (there's no backend filter endpoint - see
 * transactionService.getTransactionsByUser). Sort is a mix: the two
 * amount/date options are real server-side sorts; the two risk options
 * are client-side, labeled "(this page)" so that distinction is visible,
 * not just documented in a comment nobody reads.
 */
export default function TransactionFilters({ filters, onChange, sort, onSortChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Select label="Type" value={filters.type} onChange={(v) => set('type', v)} options={TYPES} />
      <Select label="Risk Level" value={filters.riskLevel} onChange={(v) => set('riskLevel', v)} options={RISK_LEVELS} />
      <Select label="Prediction" value={filters.prediction} onChange={(v) => set('prediction', v)} options={PREDICTIONS} />
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Min Amount</label>
        <input
          type="number"
          min={0}
          value={filters.minAmount}
          onChange={(e) => set('minAmount', e.target.value)}
          placeholder="0"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-ink focus:border-azure focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Max Amount</label>
        <input
          type="number"
          min={0}
          value={filters.maxAmount}
          onChange={(e) => set('maxAmount', e.target.value)}
          placeholder="Any"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-ink focus:border-azure focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">From Date</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => set('startDate', e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-ink focus:border-azure focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">To Date</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => set('endDate', e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-ink focus:border-azure focus:outline-none"
        />
      </div>
      <Select label="Sort" value={sort} onChange={onSortChange} options={SORT_OPTIONS} />
    </div>
  );
}
