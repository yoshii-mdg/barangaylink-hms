import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Blocks authenticated users from accessing guest-only pages (login, signup, etc).
 * Redirects each role to their own dashboard instead of a hardcoded path.
 */
export default function GuestRoute({ children }) {
    const { isAuthenticated, isLoading, getDashboardPath } = useAuth();

    if (isLoading) return null;

    if (isAuthenticated) {
        return <Navigate to={getDashboardPath()} replace />;
    }

    return children;
}