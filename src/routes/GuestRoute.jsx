import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Blocks authenticated users from guest-only pages (login, signup, etc.)
 * and redirects them to their dashboard.
 *
 * BUG FIX: Previously returned null while loading, which made the auth
 * pages appear completely blank for the duration of the session check.
 * Now shows a full-screen loader to give user feedback.
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#005F02] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}