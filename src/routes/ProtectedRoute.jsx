/**
 * ProtectedRoute.jsx
 *
 * Fixes:
 *  - Renders a full-screen spinner instead of null while auth is loading,
 *    preventing blank-screen flash and layout shift.
 *  - Guards on both `isAuthenticated` AND `userRole` being resolved to avoid
 *    showing a role-mismatch redirect before the role is actually known.
 *  - Wrong-role redirect sends the user to their correct dashboard instead of
 *    a dead route.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

function AuthSpinner() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F3F7F3]"
      role="status"
      aria-label="Loading…"
    >
      <div className="w-10 h-10 border-4 border-[#005F02] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Guards a route by auth state and optionally by allowed roles.
 *
 * @param {string[]} allowedRoles - If empty, any authenticated user may access.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, userRole, getDashboardPath } = useAuth();

  // Show spinner until BOTH session and role are resolved
  if (isLoading) return <AuthSpinner />;

  // Not logged in → send to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Role restriction: if roles are specified and this user's role isn't in the list,
  // redirect to their own dashboard (not an error page)
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}