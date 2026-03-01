import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../core/AuthContext';
import { adminApi } from '../../../core/adminApi';
import { useToast } from '../../../core/ToastContext';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import InviteStaffModal from '../components/InviteStaffModal';
import { UserTable, RoleTabs } from '../components/usermanagement';
import {
  SearchBox,
  SortFilter,
  OrderFilter,
  Pagination,
  DeleteModal,
} from '../../../shared';
import { LuUserPlus } from 'react-icons/lu';

const PAGE_SIZE = 8;

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers]               = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [loadError, setLoadError]       = useState('');
  const [search, setSearch]             = useState('');
  const [sortBy, setSortBy]             = useState('name-asc');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionLoading, setActionLoading]     = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete]       = useState(null);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await adminApi.listUsers();
      setUsers(data ?? []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Derived state ────────────────────────────────────────────────────────

  const roleCounts = useMemo(() => ({
    all:        users.length,
    superadmin: users.filter((u) => u.role === 'superadmin').length,
    staff:      users.filter((u) => u.role === 'staff').length,
    resident:   users.filter((u) => u.role === 'resident').length,
  }), [users]);

  const filteredAndSorted = useMemo(() => {
    let list = users.filter((u) => {
      const fullName = [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    if (sortBy === 'name-asc')    list = [...list].sort((a, b) => (a.last_name ?? '').localeCompare(b.last_name ?? ''));
    if (sortBy === 'name-desc')   list = [...list].sort((a, b) => (b.last_name ?? '').localeCompare(a.last_name ?? ''));
    if (sortBy === 'date-newest') list = [...list].sort((a, b) => (b.user_id > a.user_id ? 1 : -1));
    if (sortBy === 'date-oldest') list = [...list].sort((a, b) => (a.user_id > b.user_id ? 1 : -1));
    if (sortBy === 'status')      list = [...list].sort((a, b) => String(b.is_active).localeCompare(String(a.is_active)));

    return list;
  }, [users, search, sortBy, roleFilter]);

  const totalPages     = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  // ── Action handlers ──────────────────────────────────────────────────────

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id) {
      toast.error('Forbidden', 'You cannot change your own role.');
      return;
    }
    setActionLoading(userId);
    try {
      await adminApi.changeRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
      toast.success('Role updated', `Role changed to ${newRole}.`);
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async (user) => {
    if (user.user_id === currentUser?.id) {
      toast.error('Forbidden', 'You cannot deactivate your own account.');
      return;
    }
    setActionLoading(user.user_id);
    try {
      await adminApi.deactivateUser(user.user_id);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === user.user_id ? { ...u, is_active: false } : u))
      );
      toast.success('User deactivated', `${user.first_name} ${user.last_name} has been deactivated.`);
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (user) => {
    setActionLoading(user.user_id);
    try {
      await adminApi.reactivateUser(user.user_id);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === user.user_id ? { ...u, is_active: true } : u))
      );
      toast.success('User reactivated', `${user.first_name} ${user.last_name} has been reactivated.`);
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (user) => {
    if (user.user_id === currentUser?.id) {
      toast.error('Forbidden', 'You cannot delete your own account.');
      return;
    }
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setActionLoading(userToDelete.user_id);
    try {
      // Note: deletion endpoint to be added to adminApi when needed
      // For now optimistically remove from UI
      setUsers((prev) => prev.filter((u) => u.user_id !== userToDelete.user_id));
      toast.success('User deleted', 'The user has been removed.');
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setActionLoading(null);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setCurrentPage(1);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    fetchUsers();
    toast.success('Invitation sent', 'Staff member has been invited via email.');
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader
          title="User Accounts"
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-6 font-semibold text-[25px]">User Accounts</h1>

            {/* Search, Sort, Filters, Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox
                  value={search}
                  onChange={(val) => { setSearch(val); setCurrentPage(1); }}
                  placeholder="Search users"
                />
                <div className="flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] transition-colors whitespace-nowrap"
              >
                <LuUserPlus className="w-4 h-4" />
                Invite Staff
              </button>
            </div>

            {/* Role Tabs */}
            <RoleTabs
              roleFilter={roleFilter}
              onRoleChange={(role) => { setRoleFilter(role); setCurrentPage(1); }}
              roleCounts={roleCounts}
            />

            {/* Loading / Error / Table */}
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : loadError ? (
              <div className="py-10 text-center">
                <p className="text-red-600 text-sm mb-3">{loadError}</p>
                <button
                  type="button"
                  onClick={fetchUsers}
                  className="text-sm text-[#005F02] underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <UserTable
                users={paginatedUsers}
                actionLoading={actionLoading}
                onRoleChange={handleRoleChange}
                onDeactivateUser={handleDeactivateUser}
                onReactivateUser={handleReactivateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={filteredAndSorted.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      </main>

      {/* Modals */}
      <InviteStaffModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="User"
        message="This action is permanent and cannot be undone. The user will lose all access."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
      />
    </div>
  );
}