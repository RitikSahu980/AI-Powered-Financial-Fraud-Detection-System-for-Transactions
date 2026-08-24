import { useState } from 'react';
import { Search, Info, Mail, Hash } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ProfileCard from '../../components/shared/ProfileCard';
import { findUserByEmail } from '../../services/userService';
import { normalizeApiError } from '../../api/axios';

/**
 * There is no GET /users (list-all) endpoint on this backend, and no
 * activate/deactivate endpoint either - see userService.js. Building a
 * paginated "all registered users" table here would mean either faking
 * data or silently showing an empty list forever, both worse than
 * being direct about it. What genuinely works - looking a user up by
 * email or id - is offered as the real tool it is.
 */
export default function UsersPage() {
  const [email, setEmail] = useState('');
  const [foundUserId, setFoundUserId] = useState(null);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSearching(true);
    setError(null);
    setFoundUserId(null);
    try {
      const user = await findUserByEmail(email.trim());
      setFoundUserId(user.userId);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized.status === 404 ? 'No user found with that email.' : normalized.message);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Look up a registered user by email.</p>
      </div>

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-azure/20 bg-azure-50 px-4 py-3 text-sm text-azure">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>
          There's no endpoint to list every registered user, or to activate/deactivate an account, on this backend
          yet - only lookup by email or user ID. Search below to find a specific user.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-5 flex items-end gap-3">
        <div className="flex-1">
          <Input
            id="userEmail"
            label="Email"
            icon={Mail}
            placeholder="analyst@frauddetection.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-auto px-5" icon={Search} isLoading={isSearching}>
          Search
        </Button>
      </form>

      {error && <p className="mb-4 text-sm font-medium text-risk-high">{error}</p>}

      {foundUserId && (
        <>
          <p className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Hash size={12} /> {foundUserId}
          </p>
          <ProfileCard userId={foundUserId} />
        </>
      )}
    </div>
  );
}
