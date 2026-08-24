import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  History,
  User,
  Settings,
  LogOut,
  Wallet,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },

  { to: "/user/transfer", label: "Transfer Money", icon: Send },

  { to: "/user/history", label: "Transaction History", icon: History },

  {
    to: "/user/fraud-simulator",
    label: "Fraud Simulator",
    icon: ShieldAlert,
  },

  { to: "/user/profile", label: "Profile", icon: User },

  { to: "/user/settings", label: "Settings", icon: Settings },
];

/** User Portal shell (USER role). Everything here lives under /user/*. */
export default function UserLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-100 bg-surface">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-azure/10">
            <Wallet size={19} className="text-azure" />
          </div>
          <div>
            <span className="font-display text-lg font-semibold leading-none text-ink">
              Sentinel Pay
            </span>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Personal Banking
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/user/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-azure-50 text-azure"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-3 py-4">
          <div className="flex items-center justify-between gap-2 rounded-xl px-1">
            <NavLink
              to="/user/profile"
              className="min-w-0 flex-1 rounded-xl px-2 py-2 transition hover:bg-slate-50"
            >
              <p className="truncate text-xs font-medium text-ink">
                {user?.fullName || user?.userId}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                Personal account
              </p>
            </NavLink>
            <button
              onClick={logout}
              aria-label="Log out"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
