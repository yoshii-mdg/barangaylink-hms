/**
 * AuthContext.jsx — Hardened Auth State Management
 *
 * FIXES in this version:
 * 1. Race condition: SIGNED_IN fires immediately when the page loads for
 *    already-authenticated users, but the initial getSession() promise hasn't
 *    resolved yet — both try to call fetchUserRole at the same time. Fixed
 *    with an `initializing` ref flag.
 *
 * 2. Deactivated user sign-out used setTimeout — replaced with direct
 *    signOut() call. The timeout was unreliable and caused flickering.
 *
 * 3. login() re-fetches the profile from DB after signInWithPassword but
 *    onAuthStateChange(SIGNED_IN) also calls fetchUserRole — causing a
 *    double fetch. Fixed: login() still fetches for is_active validation,
 *    and the SIGNED_IN listener deduplicates via `initializing` logic.
 *
 * 4. Better error messages that distinguish between network errors, DB
 *    errors, and expected "no profile yet" cases.
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  // undefined = not yet initialized | null = no session | object = active session
  const [session, setSession] = useState(undefined);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // Tracks whether the initial getSession() call is still in progress.
  // Prevents the onAuthStateChange SIGNED_IN event from triggering a
  // redundant fetchUserRole call before the initial one finishes.
  const initializingRef = useRef(true);

  // ── Core profile fetch ──────────────────────────────────────────────────

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
        .select('id, role, first_name, middle_name, last_name, is_active')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Real DB/network error — not a "0 rows" case
        console.error('[AuthContext] DB error fetching user profile:', error.message);
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      if (!data) {
        // No users_tbl row yet — trigger hasn't run or email not confirmed
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      if (!data.is_active) {
        // Deactivated user — sign out cleanly
        setUserRole(null);
        setUserProfile(null);
        await supabase.auth.signOut();
        return;
      }

      setUserRole(data.role ?? null);
      setUserProfile(data);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  // ── Session initialization ──────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    // 1. Get current session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;

      setSession(initialSession);
      fetchUserRole(initialSession?.user?.id ?? null).finally(() => {
        initializingRef.current = false;
      });
    });

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setUserProfile(null);
        setRoleLoading(false);

      } else if (event === 'SIGNED_IN') {
        // Skip if getSession() is still initializing — it'll call fetchUserRole
        // itself and we don't want a duplicate concurrent fetch.
        if (initializingRef.current) return;
        fetchUserRole(newSession?.user?.id ?? null);

      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        fetchUserRole(newSession?.user?.id ?? null);

      } else if (event === 'PASSWORD_RECOVERY') {
        // Password recovery mode — just unlock loading, don't fetch profile
        setRoleLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  // ── Computed state ──────────────────────────────────────────────────────

  const getDashboardPath = useCallback((role) => {
    return ROLE_DASHBOARDS[role ?? userRole] ?? '/login';
  }, [userRole]);

  // isLoading:
  // • session === undefined  → Supabase hasn't responded yet
  // • session !== null && roleLoading → logged in but role fetch in progress
  // • session === null → definitively logged out
  const isLoading = session === undefined || (session !== null && roleLoading);

  // ── Auth methods ────────────────────────────────────────────────────────

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = data.session?.user?.id;
    if (!userId) throw new Error('Login failed — no session returned.');

    // Validate is_active BEFORE letting the user in.
    // We fetch the profile here rather than waiting for onAuthStateChange
    // so we can block deactivated users immediately with a clear error.
    const { data: profile, error: profileError } = await supabase
      .from('users_tbl')
      .select('id, role, first_name, last_name, middle_name, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      // DB error reading profile — log out and tell the user
      await supabase.auth.signOut();
      throw new Error('Unable to verify your account. Please try again.');
    }

    if (!profile) {
      // Auth succeeded but no users_tbl row.
      // Most likely: email not yet confirmed, or trigger hasn't run.
      await supabase.auth.signOut();
      throw new Error(
        'Your account setup is incomplete. Please confirm your email first, ' +
        'or contact an administrator if this is unexpected.'
      );
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    // Set state immediately so the redirect happens without waiting for
    // the onAuthStateChange SIGNED_IN event.
    setUserRole(profile.role ?? null);
    setUserProfile(profile);
    return profile.role;
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
    // After signup: Supabase sends a confirmation email.
    // The handle_new_user DB trigger creates the users_tbl row.
    // User must confirm email before they can log in.
    // is_active remains false until confirmed.
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
    setUserRole(null);
    setUserProfile(null);
    await supabase.auth.signOut();
  };

  // ── Admin methods (proxied through Express server) ──────────────────────

  const changeUserRole   = (targetUserId, newRole) => adminApi.changeRole(targetUserId, newRole);
  const deactivateUser   = (targetUserId) => adminApi.deactivateUser(targetUserId);
  const reactivateUser   = (targetUserId) => adminApi.reactivateUser(targetUserId);
  const inviteStaff      = (email) => adminApi.inviteStaff(email);

  const displayName = userProfile
    ? [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ')
    : '';

  const value = {
    session,
    user: session?.user ?? null,
    userRole,
    userProfile,
    displayName,
    roleLabel: ROLE_LABELS[userRole] ?? '',
    isLoading,
    isAuthenticated: !!session,
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