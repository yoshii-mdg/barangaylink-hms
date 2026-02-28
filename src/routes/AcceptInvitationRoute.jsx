/**
 * AcceptInvitationRoute.jsx
 *
 * Fixes:
 *  1. Sets `isOnInvitationPageRef.current = true` when mounted so that
 *     AuthContext's fetchUserRole does NOT sign out the inactive invited user.
 *     Resets the ref on unmount. This replaces the fragile
 *     `window.location.pathname === '/accept-invitation'` check in fetchUserRole.
 *  2. Renders a spinner instead of null during loading.
 *  3. Correctly distinguishes invited users (user_metadata.role is set) from
 *     normal authenticated users to prevent unwanted redirects.
 */

import { useEffect } from 'react';
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

export default function AcceptInvitationRoute({ children }) {
  const {
    isAuthenticated,
    isLoading,
    session,
    getDashboardPath,
    isOnInvitationPageRef,
  } = useAuth();

  // Tell AuthContext we're on the invitation page so it won't auto-sign-out
  // an inactive (not yet activated) invited user.
  useEffect(() => {
    isOnInvitationPageRef.current = true;
    return () => {
      isOnInvitationPageRef.current = false;
    };
  }, [isOnInvitationPageRef]);

  if (isLoading) return <AuthSpinner />;

  if (isAuthenticated) {
    // An invited user has `role` in user_metadata (set by inviteUserByEmail).
    // A fully-activated normal user does NOT have this metadata field.
    const isInvitedUser = !!session?.user?.user_metadata?.role;
    if (!isInvitedUser) {
      return <Navigate to={getDashboardPath()} replace />;
    }
  }

  // Either: invited user (has session but is_active=false) or no session at all
  // (AcceptInvitation page will show INVALID_LINK state)
  return children;
}