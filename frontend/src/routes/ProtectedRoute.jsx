import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards nested routes behind authentication. Unauthenticated visitors are
 * sent to /login, carrying the page they were trying to reach in
 * navigation state so Login can send them back after a successful sign-in.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
