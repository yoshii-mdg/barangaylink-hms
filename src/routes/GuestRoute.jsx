import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/** Blocks authenticated users from guest-only pages and sends them to their dashboard. */
export default function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />;

  return children;
}