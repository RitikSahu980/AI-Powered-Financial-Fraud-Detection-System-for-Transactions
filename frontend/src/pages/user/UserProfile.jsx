import { useAuth } from '../../context/AuthContext';
import ProfileCard from '../../components/shared/ProfileCard';

export default function UserProfile() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your personal account details.</p>
      </div>
      <ProfileCard userId={user?.userId} />
    </div>
  );
}
