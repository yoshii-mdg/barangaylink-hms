import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Protects routes by authentication and optionally by role.
 *
 * Usage:
 *   <ProtectedRoute>                               // any authenticated user
 *   <ProtectedRoute allowedRoles={['resident']}>   // residents only
 *   <ProtectedRoute allowedRoles={['superadmin', 'staff']}>
 *
 * If unauthenticated → /login
 * If authenticated but wrong role → their own dashboard
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, isLoading, userRole, getDashboardPath } = useAuth();

    // Wait for both session AND role to resolve before making any decision
    if (isLoading) return null;

    // Not logged in at all
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but trying to access a route their role can't reach
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to={getDashboardPath()} replace />;
    }

    return children;
}