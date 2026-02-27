import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Guards a route by auth state and optionally by role.
 * - Unauthenticated → /login
 * - Wrong role → user's own dashboard
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, userRole, getDashboardPath } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}