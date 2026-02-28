/**
 *
 * Fixes:
 *  - Renders a spinner instead of null while auth is loading, preventing
 *    a flash where the guest page briefly renders before the redirect fires.
 *  - Only redirects once `isAuthenticated` is settled (i.e., after role fetch),
 *    so a freshly-logged-in user doesn't get sent to /login temporarily.
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

/** Blocks authenticated users from guest-only pages and redirects to their dashboard. */
export default function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth();

  if (isLoading) return <AuthSpinner />;
  if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />;

  return children;
}