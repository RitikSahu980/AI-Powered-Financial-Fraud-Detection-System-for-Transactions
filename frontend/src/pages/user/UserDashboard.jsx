import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingDown,
  ArrowLeftRight,
  ShieldCheck,
  Send,
  History,
  UserCog,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import PaymentStatusBadge from "../../components/user/PaymentStatusBadge";
import { useUserDashboard } from "../../hooks/useUserDashboard";
import { useAuth } from "../../context/AuthContext";

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const QUICK_ACTIONS = [
  { to: "/user/transfer", label: "Transfer Money", icon: Send },
  { to: "/user/history", label: "View History", icon: History },
  { to: "/user/profile", label: "Update Profile", icon: UserCog },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const {
    isLoading,
    balance,
    totalTransactions,
    todaysSpending,
    screenedCount,
    recentTransactions,
  } = useUserDashboard(user?.userId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Balance"
          value={CURRENCY.format(balance)}
          icon={Wallet}
          tone="neutral"
          caption="Demo balance"
          isLoading={isLoading}
        />
        <StatCard
          label="Today's Spending"
          value={CURRENCY.format(todaysSpending)}
          icon={TrendingDown}
          tone="neutral"
          caption="Sent today"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Transactions"
          value={totalTransactions}
          icon={ArrowLeftRight}
          tone="neutral"
          caption="All-time"
          isLoading={isLoading}
        />
        <StatCard
          label="Fraud Protected Payments"
          value={screenedCount}
          icon={ShieldCheck}
          tone="good"
          caption="Screened in real time"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-surface p-5 shadow-card lg:col-span-1">
          <p className="text-sm font-semibold text-ink">Quick actions</p>
          <div className="mt-3 space-y-2">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-3.5 py-3 text-sm font-medium text-ink transition hover:border-azure/30 hover:bg-azure-50"
              >
                <Icon size={17} className="text-azure" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-surface shadow-card lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-semibold text-ink">
              Recent transactions
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            {!isLoading && recentTransactions.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-slate-400">
                No transactions found
              </p>
            )}
            {!isLoading &&
              recentTransactions.map(({ transaction: t, prediction }) => (
                <div
                  key={t.transactionId}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{t.nameDest}</p>
                    <p className="text-xs text-slate-400">
                      {DATE.format(new Date(t.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PaymentStatusBadge prediction={prediction} />
                    <span className="w-24 text-right text-sm font-semibold tabular-nums text-ink">
                      {CURRENCY.format(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
