import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { supabase } from './supabase';
import { adminApi } from './adminApi';

const AuthContext = createContext(null);

export const ROLES = {
  SUPERADMIN: 'superadmin',
  STAFF: 'staff',
  RESIDENT: 'resident',
};

export const ROLE_DASHBOARDS = {
  [ROLES.SUPERADMIN]: '/admin/dashboard',
  [ROLES.STAFF]: '/staff/dashboard',
  [ROLES.RESIDENT]: '/resident/dashboard',
};

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]: 'Super Administrator',
  [ROLES.STAFF]: 'Barangay Staff',
  [ROLES.RESIDENT]: 'Resident',
};

export function AuthProvider({ children }) {
  // ── Core state ──────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // authLoading: true until getSession() + initial fetchUserRole() both complete
  // roleLoading: true while a fetchUserRole() DB call is in-flight
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  /**
   * Ref set by AcceptInvitationRoute while the invitation page is mounted.
   * Tells fetchUserRole not to sign out an inactive (not-yet-activated) user.
   * A ref (not state) keeps fetchUserRole's dependency array empty → stable ref.
   */
  const isOnInvitationPageRef = useRef(false);

  // ── fetchUserRole ────────────────────────────────────────────────────────
  /**
   * Fetches role + profile from users_tbl.
   * Handles all edge cases without throwing — never breaks the auth flow.
   *
   *  - No userId        → clear state (logged out)
   *  - No DB row        → clear role (authenticated but no profile yet)
   *  - is_active=false  → sign out unless on invitation page
   *  - DB error         → clear role, log error
   */
  const fetchUserRole = useCallback(async (userId) => {
    if (!userId) {
      setUserRole(null);
      setUserProfile(null);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_tbl')
        .select('role, first_name, middle_name, last_name, is_active')
        .eq('user_id', userId)
        .maybeSingle(); // null when row doesn't exist — not an error

      if (error) {
        console.error('[AuthContext] fetchUserRole error:', error.message);
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      if (!data) {
        // No profile row: user has a session but no entry in users_tbl yet.
        // Treat as authenticated but roleless. ProtectedRoute handles this.
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      if (!data.is_active) {
        if (!isOnInvitationPageRef.current) {
          await supabase.auth.signOut();
          setUserRole(null);
          setUserProfile(null);
        }
        // On invitation page: keep session alive for updatePassword() flow
        return;
      }

      setUserRole(data.role ?? null);
      setUserProfile(data);
    } finally {
      setRoleLoading(false);
    }
  }, []); // stable — isOnInvitationPageRef is a ref, not reactive state

  // ── Bootstrap & auth state listener ─────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    /**
     * Bootstrap: read the persisted session exactly once on mount.
     * authLoading is guaranteed to become false here via finally {},
     * regardless of any error in fetchUserRole or getSession.
     */
    const bootstrap = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        await fetchUserRole(initialSession?.user?.id ?? null);
      } catch (err) {
        console.error('[AuthContext] Bootstrap error:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    bootstrap();

    /**
     * Auth state listener — reacts to transitions AFTER bootstrap.
     * INITIAL_SESSION is explicitly skipped: bootstrap already handled it.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        switch (event) {
          case 'INITIAL_SESSION':
            // Already handled by bootstrap() above — skip
            break;

          case 'SIGNED_IN':
            setSession(newSession);
            await fetchUserRole(newSession?.user?.id ?? null);
            break;

          case 'SIGNED_OUT':
            setSession(null);
            setUserRole(null);
            setUserProfile(null);
            break;

          case 'TOKEN_REFRESHED':
            // Only refresh the session object — role is unchanged
            setSession(newSession);
            break;

          case 'USER_UPDATED':
          case 'PASSWORD_RECOVERY':
            setSession(newSession);
            await fetchUserRole(newSession?.user?.id ?? null);
            break;

          default:
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  // ── Computed values ──────────────────────────────────────────────────────

  /**
   * isLoading: true until both authLoading and roleLoading are false.
   * Route guards must wait for this before making any redirect decisions.
   */
  const isLoading = authLoading || roleLoading;

  /**
   * isAuthenticated: whether a valid Supabase session exists.
   *
   * IMPORTANT: This is intentionally `!!session` and NOT `!!session && !!userRole`.
   * Authentication (do you have a valid JWT?) and authorization (what's your role?)
   * are separate concerns. A user without a profile row is still "authenticated"
   * from Supabase's perspective — ProtectedRoute's allowedRoles handles the rest.
   */
  const isAuthenticated = !!session;

  const getDashboardPath = useCallback(
    (role) => ROLE_DASHBOARDS[role ?? userRole] ?? '/login',
    [userRole]
  );

  const displayName = userProfile
    ? [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ')
    : '';

  // ── Auth methods ─────────────────────────────────────────────────────────

  /**
   * login() — signs in, then eagerly checks is_active so we can throw a
   * user-friendly error. Does NOT set role/profile directly — the SIGNED_IN
   * event from onAuthStateChange handles that to avoid a double-fetch race.
   */
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = data.session?.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from('users_tbl')
        .select('is_active')
        .eq('user_id', userId)
        .maybeSingle();

      if (profile && !profile.is_active) {
        await supabase.auth.signOut(); // awaited — not setTimeout
        throw new Error(
          'Your account has been deactivated. Please contact an administrator.'
        );
      }
    }
  };

  const signup = async ({ email, password, firstName, middleName, lastName }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          middle_name: middleName || null,
          last_name: lastName,
        },
      },
    });
    if (error) throw error;
  };

  const resendConfirmation = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const logout = async () => {
    // Optimistically clear role/profile for instant UI response,
    // then sign out. SIGNED_OUT event also fires and clears session — idempotent.
    setUserRole(null);
    setUserProfile(null);
    await supabase.auth.signOut();
  };

  // ── Admin proxy methods ──────────────────────────────────────────────────
  const changeUserRole = (targetUserId, newRole) => adminApi.changeRole(targetUserId, newRole);
  const deactivateUser = (targetUserId) => adminApi.deactivateUser(targetUserId);
  const reactivateUser = (targetUserId) => adminApi.reactivateUser(targetUserId);
  const inviteStaff = (email) => adminApi.inviteStaff(email);

  // ── Context value ────────────────────────────────────────────────────────
  const value = {
    session,
    user: session?.user ?? null,
    userRole,
    userProfile,
    displayName,
    roleLabel: ROLE_LABELS[userRole] ?? '',
    isLoading,
    isAuthenticated,
    isOnInvitationPageRef,
    getDashboardPath,
    login,
    signup,
    resendConfirmation,
    resetPassword,
    updatePassword,
    logout,
    isResident: userRole === ROLES.RESIDENT,
    isStaff: userRole === ROLES.STAFF,
    isSuperAdmin: userRole === ROLES.SUPERADMIN,
    changeUserRole,
    deactivateUser,
    reactivateUser,
    inviteStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}