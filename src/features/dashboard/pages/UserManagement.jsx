// File: src/features/dashboard/pages/UserManagement.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../core/supabase';
import { adminApi } from '../../../core/adminApi';
import { useAuth, ROLES, ROLE_LABELS } from '../../../core/AuthContext';
import { useToast } from '../../../core/ToastContext';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import InviteStaffModal from '../components/InviteStaffModal';
import { PiUsersFour } from 'react-icons/pi';
import { LuSearch, LuChevronDown, LuEllipsisVertical, LuUserPlus, LuRefreshCw } from 'react-icons/lu';

const ACCESS_LABELS = {
    superadmin: 'Full Access',
    staff: 'Limited Access',
    resident: 'Read-Only',
};

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'superadmin', label: 'Super Admin' },
    { key: 'staff', label: 'Staff' },
    { key: 'resident', label: 'Resident' },
];

const SORT_OPTIONS = [
    { value: 'name-asc', label: 'Name (A–Z)' },
    { value: 'name-desc', label: 'Name (Z–A)' },
    { value: 'role', label: 'Role' },
    { value: 'status', label: 'Status' },
];

function SortDropdown({ label, options, value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
                {label}
                <LuChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F1F7F2] ${value === opt.value ? 'text-[#005F02] font-semibold' : 'text-gray-700'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ActionMenu({ targetUser, currentUserId, onPromote, onDemote, onDeactivate, onReactivate, isProcessing }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    if (targetUser.user_id === currentUserId) return <span className="text-gray-300">—</span>;

    const canPromoteToStaff = targetUser.role === ROLES.RESIDENT && targetUser.is_active;
    const canPromoteToAdmin = targetUser.role === ROLES.STAFF && targetUser.is_active;
    const canDemote = (targetUser.role === ROLES.STAFF || targetUser.role === ROLES.SUPERADMIN) && targetUser.is_active;
    const hasRoleActions = canPromoteToStaff || canPromoteToAdmin || canDemote;

    return (
        <div ref={ref} className="relative flex justify-center">
            <button
                disabled={isProcessing}
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
            >
                <LuEllipsisVertical className="w-4 h-4" />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                    {canPromoteToStaff && (
                        <button onClick={() => { onPromote(targetUser); setOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors">
                            Promote to Staff
                        </button>
                    )}
                    {canPromoteToAdmin && (
                        <button onClick={() => { onPromote(targetUser); setOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors">
                            Promote to Admin
                        </button>
                    )}
                    {canDemote && (
                        <button onClick={() => { onDemote(targetUser); setOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition-colors">
                            Demote to Resident
                        </button>
                    )}
                    {hasRoleActions && <hr className="border-gray-100 my-1" />}
                    {targetUser.is_active ? (
                        <button onClick={() => { onDeactivate(targetUser); setOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            Disable Account
                        </button>
                    ) : (
                        <button onClick={() => { onReactivate(targetUser); setOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors">
                            Enable Account
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function UserManagement() {
    const { user, changeUserRole, deactivateUser, reactivateUser, inviteStaff, userRole } = useAuth();
    const toast = useToast();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState('name-asc');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Prefer the admin API which merges auth emails into profiles.
            // Falls back to a direct profiles query (without email) if the API call fails.
            try {
                const data = await adminApi.listUsers();
                setUsers(data ?? []);
            } catch (apiErr) {
                const { data, error } = await supabase
                    .from('users_tbl')
                    .select('user_id, first_name, middle_name, last_name, role, is_active')
                    .order('last_name', { ascending: true });
                if (error) throw error;
                setUsers(data ?? []);
            }
        } catch (err) {
            setError(err.message || 'Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const counts = {
        all: users.length,
        superadmin: users.filter(u => u.role === ROLES.SUPERADMIN).length,
        staff: users.filter(u => u.role === ROLES.STAFF).length,
        resident: users.filter(u => u.role === ROLES.RESIDENT).length,
    };

    const filtered = users
        .filter(u => {
            const fullName = `${u.first_name ?? ''} ${u.middle_name ?? ''} ${u.last_name ?? ''}`.toLowerCase();
            const matchSearch = !search || fullName.includes(search.toLowerCase());
            const matchTab = activeTab === 'all' || u.role === activeTab;
            return matchSearch && matchTab;
        })
        .sort((a, b) => {
            const na = `${a.first_name ?? ''} ${a.last_name ?? ''}`.toLowerCase();
            const nb = `${b.first_name ?? ''} ${b.last_name ?? ''}`.toLowerCase();
            if (sortBy === 'name-asc') return na.localeCompare(nb);
            if (sortBy === 'name-desc') return nb.localeCompare(na);
            if (sortBy === 'role') return (a.role ?? '').localeCompare(b.role ?? '');
            if (sortBy === 'status') return String(b.is_active).localeCompare(String(a.is_active));
            return na.localeCompare(nb);
        });

    const handleAction = async (action, targetUserId, ...args) => {
        setActionLoading(targetUserId);
        try {
            await action(targetUserId, ...args);
            await fetchUsers();
            return true;
        } catch (err) {
            toast.error('Action Failed', err.message || 'Please try again.');
            return false;
        } finally {
            setActionLoading(null);
        }
    };

    const handlePromote = async (u) => {
        const name = `${u.first_name} ${u.last_name}`;
        let newRole, msg;
        if (u.role === ROLES.RESIDENT) { newRole = ROLES.STAFF; msg = `${name} is now Barangay Staff.`; }
        else if (u.role === ROLES.STAFF) { newRole = ROLES.SUPERADMIN; msg = `${name} is now a Super Admin.`; }
        else return;
        const ok = await handleAction(changeUserRole, u.user_id, newRole);
        if (ok) toast.success('Account Promoted', msg);
    };

    const handleDemote = async (u) => {
        const name = `${u.first_name} ${u.last_name}`;
        const ok = await handleAction(changeUserRole, u.user_id, ROLES.RESIDENT);
        if (ok) toast.success('Account Demoted', `${name} has been demoted to Resident.`);
    };

    const handleDeactivate = async (u) => {
        const name = `${u.first_name} ${u.last_name}`;
        const ok = await handleAction(deactivateUser, u.user_id);
        if (ok) toast.warning('Account Disabled', `${name}'s account has been disabled.`);
    };

    const handleReactivate = async (u) => {
        const name = `${u.first_name} ${u.last_name}`;
        const ok = await handleAction(reactivateUser, u.user_id);
        if (ok) toast.success('Account Enabled', `${name}'s account has been enabled.`);
    };

    const handleInvite = async (email) => {
        try {
            await inviteStaff(email);
            setShowInviteModal(false);
            await fetchUsers();
            toast.success('Invitation Sent', `Invitation sent to ${email}.`);
        } catch (err) {
            toast.error('Invitation Failed', err.message || 'Could not send the invitation.');
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F3F7F3]">
            <DashboardSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader title="User" />

                <main className="flex-1 p-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Main card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
                        {/* Card header */}
                        <div className="px-6 pt-6 pb-0">
                            <div className="flex items-center justify-between mb-5">
                                {/* Title */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                                        <PiUsersFour className="w-5 h-5 text-[#005F02]" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">User Accounts</h2>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="pl-9 pr-3 h-9 w-52 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/20 focus:border-[#005F02]"
                                        />
                                    </div>

                                    <SortDropdown label="Sort By" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />

                                    <button
                                        onClick={fetchUsers}
                                        title="Refresh"
                                        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        <LuRefreshCw className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#005F02] text-white text-sm font-medium hover:bg-[#004A01] transition-colors"
                                    >
                                        <LuUserPlus className="w-4 h-4" />
                                        Invite Staff
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-5 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                                            activeTab === tab.key
                                                ? 'text-[#005F02]'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab.label}
                                        <span className="ml-1 text-xs text-gray-400">({counts[tab.key]})</span>
                                        {activeTab === tab.key && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005F02] rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#F1F7F2]">
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Name</th>
                                        <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Email</th>
                                        <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Role</th>
                                        <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Access</th>
                                        <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
                                        <th className="px-6 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16 text-gray-400">
                                                Loading users…
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16 text-gray-400">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : filtered.map((u, idx) => {
                                        const fullName = [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(' ') || '—';
                                        const isProcessing = actionLoading === u.user_id;

                                        return (
                                            <tr
                                                key={u.user_id}
                                                className={`border-b border-gray-50 last:border-0 hover:bg-[#F8FBF8] transition-colors ${isProcessing ? 'opacity-50' : ''}`}
                                            >
                                                <td className="px-6 py-3.5 font-medium text-gray-900">
                                                    {fullName}
                                                    {u.user_id === user?.id && (
                                                        <span className="ml-2 text-xs text-gray-400 font-normal">(you)</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-gray-700">
                                                    {u.email ?? '—'}
                                                </td>
                                                <td className="px-6 py-3.5 text-gray-700">
                                                    {ROLE_LABELS[u.role] ?? u.role ?? '—'}
                                                </td>
                                                <td className="px-6 py-3.5 text-gray-500">
                                                    {ACCESS_LABELS[u.role] ?? '—'}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                        u.is_active
                                                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                                            : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {u.is_active ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <ActionMenu
                                                        targetUser={u}
                                                        currentUserId={user?.id}
                                                        onPromote={handlePromote}
                                                        onDemote={handleDemote}
                                                        onDeactivate={handleDeactivate}
                                                        onReactivate={handleReactivate}
                                                        isProcessing={isProcessing}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <InviteStaffModal
                isOpen={showInviteModal}
                onInvite={handleInvite}
                onClose={() => setShowInviteModal(false)}
            />
        </div>
    );
}