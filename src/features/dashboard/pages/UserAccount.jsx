import { useState, useMemo } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import {
  UserTable,
  RoleTabs,
} from '../components/UserAccount';
import { SortFilter, OrderFilter, Pagination, SearchBox, DeleteModal } from '../../../shared';

const MOCK_USERS = [
  {
    id: 1,
    name: 'Raine Heart Nocion',
    email: 'nocionraine.heartmagmail.com',
    role: 'Staff',
    access: 'Limited Access',
    status: 'Enabled',
  },
  {
    id: 2,
    name: 'Ariana Roxanne Malegro',
    email: 'malegro.ariona@gmail.com',
    role: 'Resident',
    access: 'Read-Only',
    status: 'Enabled',
  },
  {
    id: 3,
    name: 'Sophia Nicole Cecillano',
    email: 'cecillano.sophia@gmail.com',
    role: 'Resident',
    access: 'Read-Only',
    status: 'Enabled',
  },
  {
    id: 4,
    name: 'JM Melica Nuevo',
    email: 'nuevo.jymtelica@gmail.com',
    role: 'Resident',
    access: 'Read-Only',
    status: 'Enabled',
  },
  {
    id: 5,
    name: 'Murphy De Guzman',
    email: 'deguzmam.murphy@gmail.com',
    role: 'Super Admin',
    access: 'Full Access',
    status: 'Enabled',
  },
  {
    id: 6,
    name: 'Carlo Jesus Cacho',
    email: 'cacho.carlo.jesus@gmail.com',
    role: 'Resident',
    access: 'Read-Only',
    status: 'Disabled',
  },
  {
    id: 7,
    name: 'Grant Haell Abad',
    email: 'abad.grant.haell@gmail.com',
    role: 'Super Admin',
    access: 'Full Access',
    status: 'Disabled',
  },
  {
    id: 8,
    name: 'Jhon Carlo T. Millan',
    email: 'million.jhon.carlo@gmail.com',
    role: 'Staff',
    access: 'Limited Access',
    status: 'Enabled',
  },
  {
    id: 9,
    name: 'User Name 9',
    email: 'user9@gmail.com',
    role: 'Resident',
    access: 'Read-Only',
    status: 'Enabled',
  },
  {
    id: 10,
    name: 'User Name 10',
    email: 'user10@gmail.com',
    role: 'Staff',
    access: 'Limited Access',
    status: 'Enabled',
  },
];

const PAGE_SIZE = 8;

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleCounts = useMemo(() => {
    const counts = {
      all: users.length,
      'Super Admin': users.filter(u => u.role === 'Super Admin').length,
      'Staff': users.filter(u => u.role === 'Staff').length,
      'Resident': users.filter(u => u.role === 'Resident').length,
    };
    return counts;
  }, [users]);

  const filteredAndSorted = useMemo(() => {
    let list = users.filter((u) => {
      // Search filter
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      // Role filter
      const matchesRole =
        roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    // Sort
    if (sortBy === 'name-asc') list = [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    if (sortBy === 'name-desc') list = [...list].sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    if (sortBy === 'date-newest') list = [...list].sort((a, b) => b.id - a.id);
    if (sortBy === 'date-oldest') list = [...list].sort((a, b) => a.id - b.id);
    if (sortBy === 'status') list = [...list].sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));

    return list;
  }, [users, search, sortBy, roleFilter]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setCurrentPage(1);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: newRole }
          : u
      )
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader title="User Accounts" onMenuToggle={() => setSidebarOpen(o => !o)} />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-6 font-semibold text-[25px]">User Accounts</h1>



            {/* Search, Sort, Filters, Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox value={search} onChange={setSearch} placeholder="Search" />
                <div className="flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>
            </div>

            {/* Role Tabs */}
            <RoleTabs
              roleFilter={roleFilter}
              onRoleChange={(newRole) => {
                setRoleFilter(newRole);
                setCurrentPage(1);
              }}
              roleCounts={roleCounts}
            />

            {/* Table */}
            <UserTable
              users={paginatedUsers}
              onDeleteUser={handleDeleteUser}
              onRoleChange={handleRoleChange}
            />

            {/* Pagination */}
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

      {/* Modals rendered outside scrollable main */}
      <DeleteModal
        isOpen={deleteModalOpen}
        title="User"
        message="This record will be deleted and removed from the system."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
}
