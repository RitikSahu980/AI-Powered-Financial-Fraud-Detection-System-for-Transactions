import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function pageNumbers(current, total) {
  // current/total are 0-indexed pages; show up to 5 numbers centered on current
  const windowSize = 5;
  let start = Math.max(0, current - Math.floor(windowSize / 2));
  const end = Math.min(total - 1, start + windowSize - 1);
  start = Math.max(0, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Server-driven pagination: page/size live in the parent (TransactionsPage), this is purely presentational. */
export default function Pagination({ page, totalPages, pageSize, totalElements, onPageChange, onPageSizeChange }) {
  if (totalPages <= 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-ink focus:border-azure focus:outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="ml-2 hidden sm:inline">{totalElements} total</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers(page, totalPages).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
              p === page ? 'bg-azure text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {p + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
