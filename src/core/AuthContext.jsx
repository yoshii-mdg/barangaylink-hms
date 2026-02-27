import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  const [session, setSession] = useState(undefined);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

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
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      if (data) {
        if (!data.is_active) {
          // Sign out deactivated users immediately
          await supabase.auth.signOut();
          setUserRole(null);
          setUserProfile(null);
          return;
        }
        setUserRole(data.role ?? null);
        setUserProfile(data);
      } else {
        // No profile row yet (e.g. newly confirmed resident — profile created by DB trigger)
        setUserRole(null);
        setUserProfile(null);
      }
    } finally {
      setRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserRole(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // Always re-fetch user role on any auth state change (including SIGNED_IN)
      // so that the role is always up to date after login or email confirmation.
      fetchUserRole(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const getDashboardPath = useCallback((role) => {
    return ROLE_DASHBOARDS[role ?? userRole] ?? '/login';
  }, [userRole]);

  // ── Auth methods ─────────────────────────────────────────────────────────

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = data.session?.user?.id;
    if (!userId) return null;

    const { data: profile } = await supabase
      .from('users_tbl')
      .select('role, first_name, last_name, middle_name, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile && !profile.is_active) {
      // Sign out deactivated accounts asynchronously
      setTimeout(() => supabase.auth.signOut(), 100);
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    const role = profile?.role ?? null;
    setUserRole(role);
    setUserProfile(profile ?? null);
    return role;
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
    await supabase.auth.signOut();
    setUserRole(null);
    setUserProfile(null);
  };

  // ── Admin methods (proxied through Express server) ───────────────────────

  const changeUserRole = (targetUserId, newRole) => adminApi.changeRole(targetUserId, newRole);
  const deactivateUser = (targetUserId) => adminApi.deactivateUser(targetUserId);
  const reactivateUser = (targetUserId) => adminApi.reactivateUser(targetUserId);
  const inviteStaff = (email) => adminApi.inviteStaff(email);

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