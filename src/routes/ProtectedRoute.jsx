import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Wraps a route so only authenticated users can access it.
 * Shows nothing while session is loading, then redirects to /login if not authenticated.
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Avoid flash of login page while Supabase checks the session
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
