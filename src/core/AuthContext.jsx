import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

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
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // ── Fetch role + full profile from users_tbl ─────────────────────────────
  // FIX: Now selects full profile fields so displayName is populated on refresh.
  const fetchUserRole = async (userId) => {
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
        .select('role, first_name, middle_name, last_name')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setUserRole(data.role ?? null);
        setUserProfile(data);
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserRole(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // FIX: Skip re-fetching on SIGNED_IN — login() already fetched the profile
      // directly and set it. Re-fetching here would race and overwrite it with
      // less data. All other events (TOKEN_REFRESHED, SIGNED_OUT, etc.) still
      // go through fetchUserRole normally.
      if (event !== 'SIGNED_IN') {
        fetchUserRole(session?.user?.id ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getDashboardPath = (role) => {
    return ROLE_DASHBOARDS[role ?? userRole] ?? '/login';
  };

  // ── Auth methods ──────────────────────────────────────────────────────────

  /**
   * Login — fetches full profile and returns the role directly so the caller
   * can navigate immediately without waiting for state propagation.
   */
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = data.session?.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from('users_tbl')
        .select('role, first_name, last_name, middle_name')
        .eq('user_id', userId)
        .maybeSingle();

      const role = profile?.role ?? null;
      setUserRole(role);
      setUserProfile(profile ?? null);
      return role; // caller uses this for immediate navigation
    }
    return null;
  };

  const signup = async ({ email, password, firstName, middleName, lastName }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          // role NOT set here — DB trigger defaults to 'resident'
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
    await supabase.auth.signOut();
    setUserRole(null);
    setUserProfile(null);
  };

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
    isLoading: session === undefined || roleLoading,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}