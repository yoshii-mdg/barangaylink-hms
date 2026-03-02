import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';

/**
 * Wrapper for /accept-invitation.
 *
 * An invited user has a live Supabase session (auto-signed-in via magic link)
 * but their users_tbl row is still is_active=false, so fetchUserRole signs
 * them right back out. We detect invited users by checking
 * user_metadata.role on the session object — no extra async fetch needed.
 *
 * - Invited user  → render AcceptInvitation
 * - Normal authed → redirect to their dashboard
 * - No session    → render AcceptInvitation (it will show INVALID_LINK)
 *
 * BUG FIX: Returns a spinner instead of null during loading.
 */
export default function AcceptInvitationRoute({ children }) {
  const { isAuthenticated, isLoading, session, getDashboardPath } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7faf7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#005F02] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verifying invitation…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check if this is an invited user (they have role in user_metadata but
    // haven't completed setup yet, so isAuthenticated=true but no profile row)
    const isInvitedUser = !!session?.user?.user_metadata?.role;
    if (!isInvitedUser) return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}