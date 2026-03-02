import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Guards a route by auth state and optionally by role.
 * - Loading     → full-screen spinner (was null — caused blank flash)
 * - Unauthenticated → /login
 * - Wrong role  → user's own dashboard
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, userRole, getDashboardPath } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F7F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#005F02] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}