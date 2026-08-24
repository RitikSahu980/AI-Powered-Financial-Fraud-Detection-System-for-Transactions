import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeRouteForRole } from '../utils/roleRouting';

/**
 * Gates a route group by role. Always nested *inside* <ProtectedRoute />
 * in App.jsx, so `user` is guaranteed to exist by the time this runs -
 * this component only decides *which* portal a logged-in user may see,
 * not *whether* they're logged in.
 *
 * Accepts either `allowedRoles` (an array, for an exact-match allowlist)
 * or `isAllowed` (a predicate). The User Portal uses a predicate
 * ("not admin/analyst") rather than `allowedRoles={['USER']}`, so that an
 * unrecognized role - which `homeRouteForRole` also sends to the User
 * Portal as the least-privileged default - doesn't get rejected by this
 * guard right back to the route it was just redirected to.
 */
export default function RoleProtectedRoute({ allowedRoles, isAllowed }) {
  const { user } = useAuth();
  const allowed = isAllowed ? isAllowed(user?.role) : allowedRoles.includes(user?.role);

  if (!allowed) {
    return <Navigate to={homeRouteForRole(user?.role)} replace />;
  }

  return <Outlet />;
}
