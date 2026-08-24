import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/errors/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import UserLayout from "./layouts/UserLayout";
import { useAuth } from "./context/AuthContext";
import { homeRouteForRole, isAdminRole } from "./utils/roleRouting";

// Admin Portal (ADMIN + ANALYST roles) - existing pages, reused as-is under /admin/*
import AdminDashboard from "./pages/admin/AdminDashboard";
import DetectionPage from "./pages/detection/DetectionPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import TransactionDetails from "./pages/transactions/TransactionDetails";
import PredictionsPage from "./pages/admin/PredictionsPage";
import AlertsPage from "./pages/admin/AlertsPage";
import UsersPage from "./pages/admin/UsersPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";

// User Portal (USER role) - new
import UserDashboard from "./pages/user/UserDashboard";
import TransferMoney from "./pages/user/TransferMoney";
import UserTransactionHistory from "./pages/user/UserTransactionHistory";
import UserProfile from "./pages/user/UserProfile";
import UserSettings from "./pages/user/UserSettings";
import UserTransactionDetails from "./pages/user/UserTransactionDetails";
import FraudSimulator from "./pages/user/FraudSimulator";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

/** Sends a logged-in visitor at "/" to their portal; logged-out visitors to /login. */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  return (
    <Navigate
      to={isAuthenticated ? homeRouteForRole(user?.role) : "/login"}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
      path="/forgot-password"
      element={<ForgotPassword />}
      />
      <Route
      path="/reset-password"
      element={<ResetPassword />}
      />

      <Route element={<ProtectedRoute />}>
        {/* Admin / Analyst Portal - both roles land here (see roleRouting.js) */}
        <Route
          element={<RoleProtectedRoute allowedRoles={["ADMIN", "ANALYST"]} />}
        >
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/detection" element={<DetectionPage />} />
            <Route path="/admin/transactions" element={<TransactionsPage />} />
            <Route
              path="/admin/transactions/:transactionId"
              element={<TransactionDetails />}
            />
            <Route path="/admin/predictions" element={<PredictionsPage />} />
            <Route path="/admin/alerts" element={<AlertsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* User Portal - USER role, and any role that isn't ADMIN/ANALYST (matches homeRouteForRole's default) */}
        <Route
          element={
            <RoleProtectedRoute isAllowed={(role) => !isAdminRole(role)} />
          }
        >
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/transfer" element={<TransferMoney />} />
            <Route path="/user/history" element={<UserTransactionHistory />} />
            <Route
              path="/user/history/:transactionId"
              element={<UserTransactionDetails />}
            />
            <Route path="/user/fraud-simulator" element={<FraudSimulator />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/settings" element={<UserSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
