import { useState, useMemo, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import {
  ResidentTable,
  ResidentAddEdit,
} from '../components/residents';
import { SortFilter, OrderFilter, Pagination, SearchBox, ArchiveModal, DeleteModal } from '../../../shared';

const MOCK_RESIDENTS = [
  {
    id: 1,
    residentNo: '1234-123-12',
    name: 'JM Melca C. Nuevo',
    address: 'Dahlia Avenue St.',
    gender: 'Female',
    birthdate: '11/21/2005',
    contactNo: '09100976326',
    status: 'Active',
  },
  {
    id: 2,
    residentNo: '1234-123-13',
    name: 'John Doe',
    address: 'Dahlia Avenue St.',
    gender: 'Male',
    birthdate: '01/01/2003',
    contactNo: '09123456789',
    status: 'Active',
  },
  {
    id: 3,
    residentNo: '1234-123-14',
    name: 'Jane Smith',
    address: 'Dahlia Avenue St.',
    gender: 'Female',
    birthdate: '12/23/2004',
    contactNo: '09987654321',
    status: 'Inactive',
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: i + 4,
    residentNo: `1234-123-${String(15 + i).padStart(2, '0')}`,
    name: `Resident ${i + 4}`,
    address: 'Dahlia Avenue St.',
    gender: i % 2 === 0 ? 'Male' : 'Female',
    birthdate: '05/15/2000',
    contactNo: '09123456789',
    status: i % 3 === 0 ? 'Inactive' : 'Active',
  })),
];

const PAGE_SIZE = 8;

// Exported so ResidentAddEdit can import and reuse the same rule
export const validateContactNumber = (value) => {
  if (!value) return true; // optional
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return 'Contact number must be exactly 11 digits.';
  if (!digits.startsWith('09')) return 'Contact number must start with 09.';
  return true;
};

export default function Residents() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentToArchive, setResidentToArchive] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [residents, setResidents] = useState(MOCK_RESIDENTS);

  const filteredAndSorted = useMemo(() => {
    let list = residents.filter(
      (r) =>
        !search ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.residentNo?.includes(search) ||
        r.contactNo?.includes(search)
    );
    if (sortBy === 'name-asc') list = [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    if (sortBy === 'name-desc') list = [...list].sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    if (sortBy === 'date-newest') list = [...list].sort((a, b) => new Date(b.birthdate ?? 0) - new Date(a.birthdate ?? 0));
    if (sortBy === 'date-oldest') list = [...list].sort((a, b) => new Date(a.birthdate ?? 0) - new Date(b.birthdate ?? 0));
    if (sortBy === 'status') list = [...list].sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));
    return list;
  }, [residents, search, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const handleAddResident = async (data) => {
    const { error: insertErr } = await supabase.from('residents_tbl').insert({
      resident_no: data.idNumber || null,
      first_name: data.firstName,
      middle_name: data.middleName || null,
      last_name: data.lastName,
      suffix: data.suffix || null,
      gender: data.gender || null,
      birthdate: data.birthdate || null,
      birthplace: data.birthplace || null,
      contact_number: data.contactNumber || null,
      email_address: data.emailAddress || null,
      civil_status: data.civilStatus || null,
      nationality: data.nationality || null,
      religion: data.religion || null,
      occupation: data.occupation || null,
      household_id: data.householdId || null,
      household_role: data.householdRole || null,
      is_registered_voter: data.isRegisteredVoter ?? false,
      precinct_no: data.precinctNo || null,
      is_pwd: data.isPwd ?? false,
      pwd_id_no: data.pwdIdNo || null,
      status: data.status || 'Active',
    });
    if (insertErr) throw insertErr;
    await fetchResidents();
    setCurrentPage(1);
  };

  const handleEditResident = (resident) => {
    console.log('handleEditResident called with:', resident);
    setSelectedResident(resident);
    setEditModalOpen(true);
  };

  const handleArchiveResident = (resident) => {
    console.log('handleArchiveResident called with:', resident);
    setResidentToArchive(resident);
    setArchiveModalOpen(true);
  };

  const handleDeleteResident = (resident) => {
    console.log('handleDeleteResident called with:', resident);
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
    const name = [data.lastName, data.firstName, data.middleName, data.suffix].filter(Boolean).join(' ');
    const address = [data.houseNo, data.street, data.purok, data.barangay].filter(Boolean).join(', ');
    setResidents((prev) =>
      prev.map((r) =>
        r.id === selectedResident.id
          ? {
            ...r,
            residentNo: data.idNumber || r.residentNo,
            name: name || r.name,
            address: address || r.address,
            gender: data.gender || r.gender,
            birthdate: data.birthdate || r.birthdate,
            contactNo: data.contactNumber || r.contactNo,
            status: data.status || r.status,
          }
          : r
      )
    );
    setSelectedResident(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader title="Resident" />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className='mb-10 font-semibold text-[25px]'>Resident List</h1>
            {/* Search, Sort, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <SearchBox value={search} onChange={setSearch} placeholder="Search" />
                <div className="inline-flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>
              <div className="flex items-center gap-3">
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
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01]"
                >
                  Add New Resident
                </button>
              </div>
            </div>

            {/* Table */}
            <ResidentTable
              residents={paginatedResidents}
              onEditResident={handleEditResident}
              onArchiveResident={handleArchiveResident}
              onDeleteResident={handleDeleteResident}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={filteredAndSorted.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div >
        </section >
      </main >

      {/* Modals rendered outside scrollable main */}
      < ResidentAddEdit
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)
        }
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
        onCancel={() => {
          setArchiveModalOpen(false);
          setResidentToArchive(null);
        }}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Resident"
        message="This record will be archived and deleted from the active list."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setResidentToDelete(null);
        }}
      />
    </div >
  );
}