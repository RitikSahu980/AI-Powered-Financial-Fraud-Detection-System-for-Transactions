import { useEffect, useState } from "react";
import { User, Mail, ShieldCheck, Calendar, Hash } from "lucide-react";
import { getProfile } from "../../services/profileService";
import { normalizeApiError } from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

const STATUS_STYLES = {
  ACTIVE: "bg-risk-low-bg text-risk-low",
  BLOCKED: "bg-risk-high-bg text-risk-high",
  PENDING: "bg-risk-medium-bg text-risk-medium",
};

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 py-3.5 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={15} className="text-slate-400" /> {label}
      </span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

/** Real UserResponse data (GET /users/{id}) - fullName/email/role/accountStatus/createdAt. Nothing here is editable - there's no PUT /users endpoint on this backend. */
export default function ProfileCard({ userId }) {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setIsLoading(true);
    getProfile(userId)
      .then((p) => !cancelled && setProfile(p))
      .catch((err) => !cancelled && toast.error(normalizeApiError(err).message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  }
  if (!profile) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-card">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50 text-lg font-semibold text-azure">
          {profile.fullName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-base font-semibold text-ink">{profile.fullName}</p>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[profile.accountStatus] ?? "bg-slate-100 text-slate-500"}`}
          >
            {profile.accountStatus}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <Row icon={Mail} label="Email" value={profile.email} />
        <Row icon={ShieldCheck} label="Role" value={profile.role} />
        <Row icon={Hash} label="User ID" value={profile.userId} />
        <Row
          icon={Calendar}
          label="Member since"
          value={DATE.format(new Date(profile.createdAt))}
        />
      </div>
      {/* <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <User size={12} /> Profile details are read-only - there's no edit-profile endpoint on this backend yet.
      </p> */}
    </div>
  );
}
