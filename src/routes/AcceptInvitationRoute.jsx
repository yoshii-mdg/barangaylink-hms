/**
 * Special wrapper for the /accept-invitation route.
 *
 * Problem: When an invited user clicks the email link, Supabase immediately
 * authenticates them (sets a session). Our GuestRoute sees isAuthenticated=true
 * and redirects them away to /staff/dashboard before they can set a password.
 *
 * Fix: This route checks whether the authenticated user is an "invitation-pending"
 * user (has a role in user_metadata but hasn't set a real password yet). If so,
 * it renders the children (AcceptInvitation page) instead of redirecting.
 *
 * For a normal authenticated user who navigates to /accept-invitation accidentally,
 * redirect them to their dashboard.
 */
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { supabase } from '../core/supabase';

export default function AcceptInvitationRoute({ children }) {
    const { isAuthenticated, isLoading, getDashboardPath } = useAuth();
    const [checking, setChecking] = useState(true);
    const [isInvitedUser, setIsInvitedUser] = useState(false);

    useEffect(() => {
        const check = async () => {
            if (isLoading) return;

            if (!isAuthenticated) {
                // No session at all — let AcceptInvitation handle it
                // (it will show INVALID_LINK step)
                setIsInvitedUser(false);
                setChecking(false);
                return;
            }

            // Has a session — check if this is an invitation flow
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const meta = user?.user_metadata;

                // An invited user has a `role` in their metadata
                // set by the admin when sending the invite
                if (meta?.role) {
                    setIsInvitedUser(true);
                } else {
                    setIsInvitedUser(false);
                }
            } catch {
                setIsInvitedUser(false);
            }
            setChecking(false);
        };

        check();
    }, [isAuthenticated, isLoading]);

    if (isLoading || checking) return null;

    // Authenticated normal user — send them home
    if (isAuthenticated && !isInvitedUser) {
        return <Navigate to={getDashboardPath()} replace />;
    }

    // Either unauthenticated OR is an invited user — render the page
    return children;
}