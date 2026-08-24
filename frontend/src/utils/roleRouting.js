/**
 * Where a logged-in user lands. ADMIN and ANALYST share the Admin Portal
 * (spec: "if role == ANALYST redirect /admin/dashboard") - there is no
 * separate analyst-only surface today. Anything else (USER, or an
 * unrecognized/missing role) gets the User Portal, since that's the
 * least-privileged surface and the safer default.
 */
export function homeRouteForRole(role) {
  if (role === 'ADMIN' || role === 'ANALYST') return '/admin/dashboard';
  return '/user/dashboard';
}

export function isAdminRole(role) {
  return role === 'ADMIN' || role === 'ANALYST';
}
