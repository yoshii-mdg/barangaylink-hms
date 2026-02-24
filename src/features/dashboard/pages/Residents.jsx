import { useState, useMemo, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import {
  SearchResidents,
  ResidentTable,
  ResidentPagination,
  ResidentAddEdit,
} from '../components/residents';
import { SortFilter } from '../../../shared';
import { supabase } from '../../../core/supabase';

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
  const [selectedResident, setSelectedResident] = useState(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResidents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('residents_tbl')
        .select(
          'id, resident_no, first_name, middle_name, last_name, suffix, gender, birthdate, birthplace, contact_number, email_address, civil_status, nationality, religion, occupation, household_id, household_role, status, is_registered_voter, precinct_no, is_pwd, pwd_id_no, created_at'
        )
        .order('last_name', { ascending: true });

      if (fetchErr) throw fetchErr;

      setResidents(
        (data ?? []).map((r) => ({
          id: r.id,
          residentNo: r.resident_no ?? '—',
          name: [r.last_name, r.first_name, r.middle_name, r.suffix].filter(Boolean).join(', '),
          firstName: r.first_name ?? '',
          middleName: r.middle_name ?? '',
          lastName: r.last_name ?? '',
          suffix: r.suffix ?? '',
          gender: r.gender ?? '—',
          birthdate: r.birthdate ?? '',
          birthplace: r.birthplace ?? '',
          contactNo: r.contact_number ?? '—',
          emailAddress: r.email_address ?? '',
          civilStatus: r.civil_status ?? '',
          nationality: r.nationality ?? '',
          religion: r.religion ?? '',
          occupation: r.occupation ?? '',
          householdId: r.household_id ?? '',
          householdRole: r.household_role ?? '',
          isRegisteredVoter: r.is_registered_voter ?? false,
          precinctNo: r.precinct_no ?? '',
          isPwd: r.is_pwd ?? false,
          pwdIdNo: r.pwd_id_no ?? '',
          status: r.status ?? 'Active',
        }))
      );
    } catch (err) {
      setError(err.message || 'Failed to load residents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResidents(); }, [fetchResidents]);

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
    setSelectedResident(resident);
    setEditModalOpen(true);
  };

  const handleUpdateResident = async (data) => {
    if (!selectedResident) return;
    const { error: updateErr } = await supabase
      .from('residents_tbl')
      .update({
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
        status: data.status || selectedResident.status,
      })
      .eq('id', selectedResident.id);

    if (updateErr) throw updateErr;
    await fetchResidents();
    setSelectedResident(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="Resident List" />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <SearchResidents
                  value={search}
                  onChange={(v) => { setSearch(v); setCurrentPage(1); }}
                  placeholder="Search residents…"
                />
                <div className="inline-flex items-center gap-2">
                  <span className="text-sm font-semibold">Sort By:</span>
                  <SortFilter value={sortBy} onChange={setSortBy} />
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

            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <>
                <ResidentTable residents={paginatedResidents} onSelectResident={handleEditResident} />
                <ResidentPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalEntries={filteredAndSorted.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
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
    </div>
  );
}