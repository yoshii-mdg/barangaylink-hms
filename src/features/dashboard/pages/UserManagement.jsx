import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../core/supabase';
import { useAuth, ROLES, ROLE_LABELS } from '../../../core/AuthContext';
import InviteStaffModal from '../components/InviteStaffModal';
import { LuUserPlus, LuShieldCheck, LuShieldOff, LuRefreshCw, LuSearch } from 'react-icons/lu';

const ROLE_BADGE = {
    superadmin: 'bg-purple-100 text-purple-800',
    staff: 'bg-blue-100 text-blue-800',
    resident: 'bg-green-100 text-green-800',
};

const STATUS_BADGE = {
    true: 'bg-emerald-100 text-emerald-800',
    false: 'bg-red-100 text-red-800',
};

export default function UserManagement() {
    const { user, changeUserRole, deactivateUser, reactivateUser, inviteStaff } = useAuth();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // userId of in-progress action

    // ── Fetch all users ──────────────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data, error } = await supabase
                .from('users_tbl')
                .select('user_id, email, first_name, middle_name, last_name, role, is_active, invited_by')
                .order('last_name', { ascending: true });

            if (error) throw error;
            setUsers(data ?? []);
        } catch (err) {
            setError(err.message || 'Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ── Filtered list ────────────────────────────────────────────────────────
    const filtered = users.filter((u) => {
        const fullName = `${u.first_name} ${u.middle_name ?? ''} ${u.last_name}`.toLowerCase();
        const matchSearch =
            !search ||
            fullName.includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    // ── Actions ──────────────────────────────────────────────────────────────
    const handleAction = async (action, targetUserId, ...args) => {
        setActionLoading(targetUserId);
        setError('');
        try {
            await action(targetUserId, ...args);
            await fetchUsers(); // refresh list
        } catch (err) {
            setError(err.message || 'Action failed. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleInvite = async (email) => {
        setError('');
        try {
            await inviteStaff(email);
            setShowInviteModal(false);
            // We can't immediately show the new user until they accept the invite,
            // but refresh anyway in case the DB row was created.
            await fetchUsers();
        } catch (err) {
            throw err; // Let InviteStaffModal display the error
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="p-6 space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage accounts, roles, and access for all registered users.
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 bg-[#005F02] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#004A01] transition-colors"
                >
                    <LuUserPlus className="w-4 h-4" />
                    Invite Staff
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] bg-white"
                >
                    <option value="all">All Roles</option>
                    <option value={ROLES.SUPERADMIN}>Super Admin</option>
                    <option value={ROLES.STAFF}>Staff</option>
                    <option value={ROLES.RESIDENT}>Resident</option>
                </select>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Refresh"
                >
                    <LuRefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                </div>
            )}

            {/* Table */}
            {isLoading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading users…</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">No users found.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-500 uppercase text-xs tracking-wide">
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Role</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((u) => {
                                const isSelf = u.user_id === user?.id;
                                const isLoading = actionLoading === u.user_id;
                                const fullName = [u.first_name, u.middle_name, u.last_name]
                                    .filter(Boolean)
                                    .join(' ') || '—';

                                return (
                                    <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {fullName}
                                            {isSelf && (
                                                <span className="ml-2 text-xs text-gray-400">(you)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {ROLE_LABELS[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[String(u.is_active)]}`}>
                                                {u.is_active ? 'Active' : 'Deactivated'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                {/* Promotion actions — disabled for self */}
                                                {!isSelf && u.role === ROLES.RESIDENT && u.is_active && (
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => handleAction(changeUserRole, u.user_id, ROLES.STAFF)}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                                                        title="Promote to Staff"
                                                    >
                                                        <LuShieldCheck className="w-3.5 h-3.5" />
                                                        Promote to Staff
                                                    </button>
                                                )}
                                                {!isSelf && u.role === ROLES.STAFF && u.is_active && (
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => handleAction(changeUserRole, u.user_id, ROLES.SUPERADMIN)}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors"
                                                        title="Promote to Super Admin"
                                                    >
                                                        <LuShieldCheck className="w-3.5 h-3.5" />
                                                        Promote to Admin
                                                    </button>
                                                )}

                                                {/* Deactivate / Reactivate — never for self */}
                                                {!isSelf && u.is_active && (
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => {
                                                            if (window.confirm(`Deactivate ${fullName}'s account? They will be immediately locked out.`)) {
                                                                handleAction(deactivateUser, u.user_id);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                                        title="Deactivate account"
                                                    >
                                                        <LuShieldOff className="w-3.5 h-3.5" />
                                                        Deactivate
                                                    </button>
                                                )}
                                                {!isSelf && !u.is_active && (
                                                    <button
                                                        disabled={isLoading}
                                                        onClick={() => handleAction(reactivateUser, u.user_id)}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                                                        title="Reactivate account"
                                                    >
                                                        <LuShieldCheck className="w-3.5 h-3.5" />
                                                        Reactivate
                                                    </button>
                                                )}

                                                {isSelf && (
                                                    <span className="text-xs text-gray-400 italic">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invite modal */}
            <InviteStaffModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onInvite={handleInvite}
            />
        </div>
    );
}