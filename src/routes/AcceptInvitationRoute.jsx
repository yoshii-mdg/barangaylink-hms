import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Wrapper for /accept-invitation.
 *
 * An invited user has a live session (Supabase auto-signs them in via the
 * magic link) but their users_tbl row is still is_active=false, so
 * fetchUserRole signs them right back out. We detect them by checking
 * user_metadata.role on the session object — no extra async fetch needed.
 *
 * - Invited user  → render AcceptInvitation
 * - Normal authed → redirect to their dashboard
 * - No session    → render AcceptInvitation (it will show INVALID_LINK)
 */
export default function AcceptInvitationRoute({ children }) {
  const { isAuthenticated, isLoading, session, getDashboardPath } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    const isInvitedUser = !!session?.user?.user_metadata?.role;
    if (!isInvitedUser) return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}