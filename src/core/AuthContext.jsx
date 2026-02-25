// ─────────────────────────────────────────────────────────────────────────────
// PATCH: Only the login() function and inviteStaff() need changes.
// Replace those two functions in your existing AuthContext.jsx.
//
// Changes:
//   login()       — Removed the "invited user" branch that re-activated accounts.
//                   AcceptInvitation now sets is_active=true BEFORE the user logs
//                   in for the first time, so login() only needs to block accounts
//                   that are genuinely deactivated (is_active === false AND no
//                   invite metadata). The old code was also setting is_active based
//                   on user_metadata.role which gets cleared after updatePassword().
//
//   inviteStaff() — No change needed; still creates user + sets is_active=false.
//                   AcceptInvitation.jsx now sets is_active=true on form submit.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseAdmin } from './supabase';

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

  // ── Fetch role + full profile from users_tbl ─────────────────────────────
  const fetchUserRole = async (userId) => {
    if (!userId) {
      setUserRole(null);
      setUserProfile(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    try {
      let { data, error } = await supabase
        .from('users_tbl')
        .select('role, first_name, middle_name, last_name, is_active')
        .eq('user_id', userId)
        .single();

      // If no profile exists, create one
      if (error && error.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser();
        const inviteData = user?.user_metadata;
        const role = inviteData?.role || ROLES.RESIDENT;

        const { error: insertError } = await supabaseAdmin
          .from('users_tbl')
          .insert({
            user_id: userId,
            role,
            first_name: inviteData?.first_name || '',
            middle_name: inviteData?.middle_name || '',
            last_name: inviteData?.last_name || '',
            is_active: true,
          });

        if (insertError) {
          console.error('Failed to create user profile:', insertError);
          setUserRole(null);
          setUserProfile(null);
        } else {
          const { data: newData } = await supabase
            .from('users_tbl')
            .select('role, first_name, middle_name, last_name, is_active')
            .eq('user_id', userId)
            .single();
          data = newData;
        }
      } else if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
        setUserProfile(null);
      }

      if (data) {
        if (!data.is_active) {
          // Deactivated account — sign them out completely
          await supabase.auth.signOut();
          setUserRole(null);
          setUserProfile(null);
          return;
        }
        setUserRole(data.role ?? null);
        setUserProfile(data);
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

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = data.session?.user?.id;
    if (!userId) return null;

    let { data: profile } = await supabase
      .from('users_tbl')
      .select('role, first_name, last_name, middle_name, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    // If no profile exists yet, create one (new resident signup path)
    if (!profile) {
      const { data: { user } } = await supabase.auth.getUser();
      const inviteData = user?.user_metadata;
      const role = inviteData?.role || ROLES.RESIDENT;

      const { error: insertError } = await supabaseAdmin
        .from('users_tbl')
        .insert({
          user_id: userId,
          email,
          role,
          first_name: inviteData?.first_name || '',
          middle_name: inviteData?.middle_name || '',
          last_name: inviteData?.last_name || '',
          is_active: true,
        });

      if (!insertError) {
        const { data: newProfile } = await supabase
          .from('users_tbl')
          .select('role, first_name, last_name, middle_name, is_active')
          .eq('user_id', userId)
          .maybeSingle();
        profile = newProfile;
      }
    }

    // Block deactivated accounts.
    // NOTE: Invited users who completed AcceptInvitation will already have
    // is_active=true in the DB (set by AcceptInvitation before updatePassword).
    // So we no longer need a special "invited user" branch here.
    if (profile && !profile.is_active) {
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
          middle_name: middleName,
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

  // ── User Management methods (Super Admin only) ───────────────────────────

  const changeUserRole = async (targetUserId, newRole) => {
    if (userRole !== ROLES.SUPERADMIN) throw new Error('Unauthorized: Only Super Admins can change roles');
    if (!Object.values(ROLES).includes(newRole)) throw new Error('Invalid role');
    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ role: newRole })
      .eq('user_id', targetUserId);
    if (error) throw error;
  };

  const deactivateUser = async (targetUserId) => {
    if (userRole !== ROLES.SUPERADMIN) throw new Error('Unauthorized: Only Super Admins can deactivate users');
    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ is_active: false })
      .eq('user_id', targetUserId);
    if (error) throw error;
  };

  const reactivateUser = async (targetUserId) => {
    if (userRole !== ROLES.SUPERADMIN) throw new Error('Unauthorized: Only Super Admins can reactivate users');
    const { error } = await supabaseAdmin
      .from('users_tbl')
      .update({ is_active: true })
      .eq('user_id', targetUserId);
    if (error) throw error;
  };

  const inviteStaff = async (email) => {
    if (userRole !== ROLES.SUPERADMIN) throw new Error('Unauthorized: Only Super Admins can invite staff');

    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        role: ROLES.STAFF,
        invited_by: session?.user?.id,
      },
      redirectTo: `${window.location.origin}/accept-invitation`,
    });

    if (inviteError) throw inviteError;

    // Create the users_tbl row as inactive — AcceptInvitation will set is_active=true
    if (data?.user?.id) {
      // Insert or update the row with is_active: false
      await supabaseAdmin
        .from('users_tbl')
        .upsert({
          user_id: data.user.id,
          role: ROLES.STAFF,
          is_active: false,
          first_name: '',
          middle_name: null,
          last_name: '',
        }, { onConflict: 'user_id' });
    }
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