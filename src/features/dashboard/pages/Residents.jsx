import { useState, useMemo, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { ResidentTable, ResidentAddEdit } from '../components/residents';
import {
  SortFilter,
  OrderFilter,
  Pagination,
  SearchBox,
  ArchiveModal,
  DeleteModal,
} from '../../../shared';
import { supabase } from '../../../core/supabase';

const PAGE_SIZE = 8;

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedResident, setSelectedResident] = useState(null);
  const [residentToArchive, setResidentToArchive] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);

  const fetchResidents = useCallback(async () => {
    const { data, error } = await supabase
      .from('residents_tbl')
      .select(
        'id, resident_no, first_name, middle_name, last_name, suffix, gender, birthdate, contact_number, status'
      )
      .order('last_name', { ascending: true });

    if (error) return;

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      residentNo: r.resident_no ?? '—',
      name: [r.last_name, r.first_name, r.middle_name, r.suffix].filter(Boolean).join(' '),
      address: '—',
      gender: r.gender ?? '—',
      birthdate: r.birthdate ?? '—',
      contactNo: r.contact_number ?? '—',
      status: r.status ?? 'Active',
    }));

    setResidents(mapped);
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const filteredAndSorted = useMemo(() => {
    let list = residents.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.residentNo.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'name-asc')    list = [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    if (sortBy === 'name-desc')   list = [...list].sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    if (sortBy === 'date-newest') list = [...list].sort((a, b) => new Date(b.birthdate ?? 0) - new Date(a.birthdate ?? 0));
    if (sortBy === 'date-oldest') list = [...list].sort((a, b) => new Date(a.birthdate ?? 0) - new Date(b.birthdate ?? 0));
    if (sortBy === 'status')      list = [...list].sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));
    return list;
  }, [residents, search, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const handleAddResident = async (data) => {
    const { error: insertErr } = await supabase.from('residents_tbl').insert({
      resident_no:        data.idNumber || null,
      first_name:         data.firstName,
      middle_name:        data.middleName || null,
      last_name:          data.lastName,
      suffix:             data.suffix || null,
      gender:             data.gender || null,
      birthdate:          data.birthdate || null,
      birthplace:         data.birthplace || null,
      contact_number:     data.contactNumber || null,
      email_address:      data.emailAddress || null,
      civil_status:       data.civilStatus || null,
      nationality:        data.nationality || null,
      religion:           data.religion || null,
      occupation:         data.occupation || null,
      household_id:       data.householdId || null,
      household_role:     data.householdRole || null,
      is_registered_voter: data.isRegisteredVoter ?? false,
      precinct_no:        data.precinctNo || null,
      is_pwd:             data.isPwd ?? false,
      pwd_id_no:          data.pwdIdNo || null,
      status:             data.status || 'Active',
    });
    if (insertErr) throw insertErr;
    await fetchResidents();
    setCurrentPage(1);
  };

  const handleEditResident = (resident) => {
    setSelectedResident(resident);
    setEditModalOpen(true);
  };

  const handleArchiveResident = (resident) => {
    setResidentToArchive(resident);
    setArchiveModalOpen(true);
  };

  const handleDeleteResident = (resident) => {
    setResidentToDelete(resident);
    setDeleteModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (residentToArchive) {
      setResidents((prev) => prev.filter((r) => r.id !== residentToArchive.id));
      setArchiveModalOpen(false);
      setResidentToArchive(null);
      setCurrentPage(1);
    }
  };

  const handleConfirmDelete = () => {
    if (residentToDelete) {
      setResidents((prev) => prev.filter((r) => r.id !== residentToDelete.id));
      setDeleteModalOpen(false);
      setResidentToDelete(null);
      setCurrentPage(1);
    }
  };

  const handleUpdateResident = (data) => {
    const name = [data.lastName, data.firstName, data.middleName, data.suffix]
      .filter(Boolean)
      .join(' ');
    const address = [data.houseNo, data.street, data.purok, data.barangay]
      .filter(Boolean)
      .join(', ');
    setResidents((prev) =>
      prev.map((r) =>
        r.id === selectedResident.id
          ? {
              ...r,
              residentNo: data.idNumber || r.residentNo,
              name:       name || r.name,
              address:    address || r.address,
              gender:     data.gender || r.gender,
              birthdate:  data.birthdate || r.birthdate,
              contactNo:  data.contactNumber || r.contactNo,
              status:     data.status || r.status,
            }
          : r
      )
    );
    setSelectedResident(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader title="Resident" onMenuToggle={() => setSidebarOpen((o) => !o)} />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-10 font-semibold text-[25px]">Resident List</h1>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <SearchBox value={search} onChange={setSearch} placeholder="Search" />
                <div className="flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => fetchResidents()}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] transition-colors whitespace-nowrap"
                >
                  Add New Resident
                </button>
              </div>
            </div>

            <ResidentTable
              residents={paginatedResidents}
              onEditResident={handleEditResident}
              onArchiveResident={handleArchiveResident}
              onDeleteResident={handleDeleteResident}
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

      <ResidentAddEdit
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddResident}
        mode="add"
      />

      <ResidentAddEdit
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedResident(null); }}
        onSubmit={handleUpdateResident}
        initialData={selectedResident}
        mode="edit"
      />

      <ArchiveModal
        isOpen={archiveModalOpen}
        title="Resident"
        message="This record will be archived and removed from the active list."
        onConfirm={handleConfirmArchive}
        onCancel={() => { setArchiveModalOpen(false); setResidentToArchive(null); }}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Resident"
        message="This record will be permanently deleted and cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setResidentToDelete(null); }}
      />
    </div>
  );
}