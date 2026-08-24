import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  ArrowLeftRight,
  Radar,
  BellRing,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Admin / Analyst Portal shell (ADMIN and ANALYST roles - see
 * roleRouting.js). Everything here lives under /admin/*. The User Portal
 * has its own separate sidebar - see layouts/UserLayout.jsx.
 */
const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    enabled: true,
  },
  // { to: '/admin/detection', label: 'Fraud Detection', icon: ScanLine, enabled: true },
  // { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight, enabled: true },
  {
    to: "/admin/predictions",
    label: "Predictions",
    icon: Radar,
    enabled: true,
  },
  { to: "/admin/alerts", label: "Alerts", icon: BellRing, enabled: true },
  { to: "/admin/users", label: "Users", icon: Users, enabled: true },
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    enabled: true,
  },
  { to: "/admin/settings", label: "Settings", icon: Settings, enabled: true },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-100 bg-surface">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-azure/10">
            <ShieldCheck size={19} className="text-azure" />
          </div>
          <div>
            <span className="font-display text-lg font-semibold leading-none text-ink">
              Sentinel
            </span>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Admin Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, enabled }) =>
            enabled ? (
              <NavLink
                key={to}
                to={to}
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
            ) : (
              <div
                key={to}
                title="Coming in a later phase"
                className="flex cursor-not-allowed items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300"
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={17} />
                  {label}
                </span>
                <span className="rounded-full bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                  Soon
                </span>
              </div>
            ),
          )}
        </nav>

        <div className="border-t border-slate-100 px-3 py-4">
          <div className="flex items-center justify-between gap-2 rounded-xl px-1">
            <NavLink
              to="/admin/profile"
              className="min-w-0 flex-1 rounded-xl px-2 py-2 transition hover:bg-slate-50"
            >
              <p className="truncate text-xs font-medium text-ink">
                {user?.fullName || user?.userId}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {user?.role}
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
