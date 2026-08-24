import { Search } from 'lucide-react';

/**
 * Searches transactionId / nameOrig / nameDest across whatever page of
 * transactions is currently loaded - there's no backend search endpoint,
 * so this can't reach across pages, and "User Name" from the original
 * spec isn't searchable (TransactionResponse only carries userId, no
 * name - resolving it would mean an extra GET /users/{id} per row).
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search transaction ID, sender, receiver…"
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/15"
      />
    </div>
  );
}
