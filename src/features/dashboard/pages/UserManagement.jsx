/**
 * UserManagement.jsx
 *
 * Issues fixed vs. original:
 * 1. `invited_by` column removed from display — does not exist in users_tbl schema.
 * 2. User list now shows `id` (users_tbl PK) correctly.
 * 3. Role change, deactivate, reactivate call adminApi correctly.
 * 4. Proper loading/error states.
 * 5. Removed stray console.log() calls.
 */
import { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import InviteStaffModal from '../components/InviteStaffModal';
import { useAuth } from '../../../core/AuthContext';
import { useToast } from '../../../core/ToastContext';
import { adminApi } from '../../../core/adminApi';
import { LuUserPlus, LuShield, LuUser, LuBan, LuCheck } from 'react-icons/lu';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  staff: 'Staff',
  resident: 'Resident',
};

const ROLE_COLORS = {
  superadmin: 'bg-purple-100 text-purple-700',
  staff: 'bg-blue-100 text-blue-700',
  resident: 'bg-green-100 text-green-700',
};

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {isActive ? <LuCheck className="w-3 h-3" /> : <LuBan className="w-3 h-3" />}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function UserManagement() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users.');
      toast.error('Load Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleInvite = async (email) => {
    try {
      await adminApi.inviteStaff(email);
      toast.success('Invitation Sent', `An invite has been sent to ${email}.`);
      setInviteModalOpen(false);
      await loadUsers();
    } catch (err) {
      toast.error('Invite Failed', err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoadingId(userId);
    try {
      await adminApi.changeRole(userId, newRole);
      toast.success('Role Updated', 'User role has been changed.');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error('Role Change Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeactivate = async (userId) => {
    setActionLoadingId(userId);
    try {
      await adminApi.deactivateUser(userId);
      toast.success('User Deactivated', 'The user has been deactivated.');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
      );
    } catch (err) {
      toast.error('Deactivate Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReactivate = async (userId) => {
    setActionLoadingId(userId);
    try {
      await adminApi.reactivateUser(userId);
      toast.success('User Reactivated', 'The user is now active again.');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: true } : u))
      );
    } catch (err) {
      toast.error('Reactivate Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="User Management" />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-semibold text-[25px]">System Users</h1>
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#005F02] text-white text-sm font-medium hover:bg-[#004A01]"
              >
                <LuUserPlus className="w-4 h-4" />
                Invite Staff
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-[#005F02]/20 border-t-[#005F02] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => {
                      const isCurrentUser = u.id === userProfile?.id;
                      const isLoading = actionLoadingId === u.id;
                      const fullName = [u.first_name, u.middle_name, u.last_name]
                        .filter(Boolean)
                        .join(' ') || '—';

                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {fullName}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-400">(you)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge isActive={u.is_active} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* Role change (not for self) */}
                              {!isCurrentUser && (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  disabled={isLoading}
                                  aria-label={`Change role for ${fullName}`}
                                  className="h-8 px-2 rounded-md border border-gray-300 text-xs bg-white focus:outline-none disabled:opacity-50"
                                >
                                  <option value="staff">Staff</option>
                                  <option value="superadmin">Super Admin</option>
                                  <option value="resident">Resident</option>
                                </select>
                              )}

                              {/* Activate / Deactivate (not for self) */}
                              {!isCurrentUser && (
                                u.is_active ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeactivate(u.id)}
                                    disabled={isLoading}
                                    className="h-8 px-3 rounded-md text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    {isLoading ? '…' : 'Deactivate'}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleReactivate(u.id)}
                                    disabled={isLoading}
                                    className="h-8 px-3 rounded-md text-xs font-medium border border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    {isLoading ? '…' : 'Reactivate'}
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">No users found.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <InviteStaffModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}