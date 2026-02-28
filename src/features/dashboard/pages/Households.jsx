import { useState, useMemo } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { HouseholdTable, HouseholdAddEdit } from '../components/households';
import {
  SortFilter,
  OrderFilter,
  StatusFilter,
  Pagination,
  SearchBox,
  ArchiveModal,
  DeleteModal,
} from '../../../shared';

const MOCK_HOUSEHOLDS = [
  { id: 1,  householdNo: '1-2345',  headMemberName: 'JM Melca C. Nueva',        address: 'Dahlia Avenue St.', members: 5, status: 'Active' },
  { id: 2,  householdNo: '2-3456',  headMemberName: 'Raine Heart Nocion',        address: 'Dahlia Avenue St.', members: 4, status: 'Active' },
  { id: 3,  householdNo: '3-4567',  headMemberName: 'Ariana Roxanne Malegro',    address: 'Dahlia Avenue St.', members: 7, status: 'Active' },
  { id: 4,  householdNo: '4-5678',  headMemberName: 'Sophia Nicole Cecillano',   address: 'Dahlia Avenue St.', members: 3, status: 'Active' },
  { id: 5,  householdNo: '5-6789',  headMemberName: 'Carlo Jesus Cacho',         address: 'Dahlia Avenue St.', members: 4, status: 'Active' },
  { id: 6,  householdNo: '6-7891',  headMemberName: 'Grant Haell Abad',          address: 'Dahlia Avenue St.', members: 6, status: 'Inactive' },
  { id: 7,  householdNo: '7-8912',  headMemberName: 'Murphy De Guzman',          address: 'Dahlia Avenue St.', members: 5, status: 'Inactive' },
  { id: 8,  householdNo: '8-9123',  headMemberName: 'Jhon Carlo T. Millan',      address: 'Dahlia Avenue St.', members: 2, status: 'Inactive' },
  { id: 9,  householdNo: '9-1234',  headMemberName: 'Household Member 9',        address: 'Dahlia Avenue St.', members: 3, status: 'Active' },
  { id: 10, householdNo: '10-2345', headMemberName: 'Household Member 10',       address: 'Dahlia Avenue St.', members: 4, status: 'Active' },
  { id: 11, householdNo: '11-3456', headMemberName: 'Household Member 11',       address: 'Dahlia Avenue St.', members: 5, status: 'Inactive' },
  { id: 12, householdNo: '12-4567', headMemberName: 'Household Member 12',       address: 'Dahlia Avenue St.', members: 6, status: 'Active' },
];

const PAGE_SIZE = 8;

export default function Households() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [households, setHouseholds] = useState(MOCK_HOUSEHOLDS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [householdToArchive, setHouseholdToArchive] = useState(null);
  const [householdToDelete, setHouseholdToDelete] = useState(null);

  const filteredAndSorted = useMemo(() => {
    let list = households.filter((h) => {
      const matchesSearch =
        !search ||
        h.householdNo?.includes(search) ||
        h.headMemberName?.toLowerCase().includes(search.toLowerCase()) ||
        h.address?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && h.status === 'Active') ||
        (statusFilter === 'inactive' && h.status === 'Inactive');

      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'name-asc')    list = [...list].sort((a, b) => (a.headMemberName ?? '').localeCompare(b.headMemberName ?? ''));
    if (sortBy === 'name-desc')   list = [...list].sort((a, b) => (b.headMemberName ?? '').localeCompare(a.headMemberName ?? ''));
    if (sortBy === 'date-newest') list = [...list].sort((a, b) => b.id - a.id);
    if (sortBy === 'date-oldest') list = [...list].sort((a, b) => a.id - b.id);
    if (sortBy === 'status')      list = [...list].sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));

    return list;
  }, [households, search, sortBy, statusFilter]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedHouseholds = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const handleAddHousehold = (data) => {
    setHouseholds((prev) => [
      ...prev,
      {
        id: Date.now(),
        householdNo: data.householdNo || '—',
        headMemberName: data.headName || '—',
        address: data.address || '—',
        members: data.members || [],
        status: 'Active',
      },
    ]);
    setCurrentPage(1);
  };

  const handleEditHousehold = (household) => {
    setSelectedHousehold(household);
    setEditModalOpen(true);
  };

  const handleArchiveHousehold = (household) => {
    setHouseholdToArchive(household);
    setArchiveModalOpen(true);
  };

  const handleDeleteHousehold = (household) => {
    setHouseholdToDelete(household);
    setDeleteModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (householdToArchive) {
      setHouseholds((prev) => prev.filter((h) => h.id !== householdToArchive.id));
      setArchiveModalOpen(false);
      setHouseholdToArchive(null);
      setCurrentPage(1);
    }
  };

  const handleConfirmDelete = () => {
    if (householdToDelete) {
      setHouseholds((prev) => prev.filter((h) => h.id !== householdToDelete.id));
      setDeleteModalOpen(false);
      setHouseholdToDelete(null);
      setCurrentPage(1);
    }
  };

  const handleUpdateHousehold = (data) => {
    setHouseholds((prev) =>
      prev.map((h) =>
        h.id === selectedHousehold.id
          ? {
              ...h,
              householdNo: data.householdNo || h.householdNo,
              headMemberName: data.headName || h.headMemberName,
              address: data.address || h.address,
              members: data.members || h.members,
            }
          : h
      )
    );
    setSelectedHousehold(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader title="Household" onMenuToggle={() => setSidebarOpen((o) => !o)} />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-10 font-semibold text-[25px]">Household List</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox value={search} onChange={setSearch} placeholder="Search" />
                <div className="flex items-center gap-2 flex-wrap">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <StatusFilter value={statusFilter} onChange={setStatusFilter} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] transition-colors whitespace-nowrap"
                >
                  Add New Household
                </button>
              </div>
            </div>

            <HouseholdTable
              households={paginatedHouseholds}
              onEditHousehold={handleEditHousehold}
              onArchiveHousehold={handleArchiveHousehold}
              onDeleteHousehold={handleDeleteHousehold}
            />

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

      <HouseholdAddEdit
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddHousehold}
        mode="add"
      />

      <HouseholdAddEdit
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedHousehold(null); }}
        onSubmit={handleUpdateHousehold}
        initialData={selectedHousehold}
        mode="edit"
      />

      <ArchiveModal
        isOpen={archiveModalOpen}
        title="Household"
        message="This record will be archived and removed from the active list."
        onConfirm={handleConfirmArchive}
        onCancel={() => { setArchiveModalOpen(false); setHouseholdToArchive(null); }}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Household"
        message="This record will be deleted and removed from the active list."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setHouseholdToDelete(null); }}
      />
    </div>
  );
}