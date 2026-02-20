import { useState, useMemo } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import {
  SearchResidents,
  SortFilter,
  ResidentTable,
  ResidentPagination,
  AddNewResident,
} from '../components/residents';

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

export default function Residents() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [residents, setResidents] = useState(MOCK_RESIDENTS);

  const filteredAndSorted = useMemo(() => {
    let list = residents.filter(
      (r) =>
        !search ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.residentNo?.includes(search) ||
        r.address?.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'name-asc') list = [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    if (sortBy === 'name-desc') list = [...list].sort((a, b) => (b.name ?? '').localeCompare(a.name ?? ''));
    if (sortBy === 'status') list = [...list].sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));
    return list;
  }, [residents, search, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const handleAddResident = (data) => {
    const name = [data.lastName, data.firstName, data.middleName, data.suffix].filter(Boolean).join(' ');
    const address = [data.houseNo, data.street, data.purok, data.barangay].filter(Boolean).join(', ');
    setResidents((prev) => [
      ...prev,
      {
        id: Date.now(),
        residentNo: data.idNumber || '—',
        name: name || '—',
        address: address || '—',
        gender: data.gender || '—',
        birthdate: data.birthdate || '—',
        contactNo: data.contactNumber || '—',
        status: data.status || 'Active',
      },
    ]);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="Resident List" />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {/* Search, Sort, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <SearchResidents value={search} onChange={setSearch} placeholder="Search" />
                <div className="inline-flex items-center gap-2">
                  <span className="text-sm font-semibold">Sort By:</span>
                  <SortFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Edit Resident Info
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
            <ResidentTable residents={paginatedResidents} />

            {/* Pagination */}
            <ResidentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={filteredAndSorted.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      </main>

      <AddNewResident
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddResident}
      />
    </div>
  );
}
