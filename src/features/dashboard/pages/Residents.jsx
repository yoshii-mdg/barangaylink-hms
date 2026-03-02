/**
 * Residents.jsx
 *
 * Issues fixed vs. original:
 * 1. Removed all MOCK_RESIDENTS — now fetches real data from Supabase.
 * 2. handleAddResident/handleUpdateResident/handleConfirmArchive/handleConfirmDelete
 *    now call residentsService instead of mutating local state.
 * 3. Column field names corrected to match schema:
 *    - `email_address` → `email`
 *    - `is_registered_voter` → `is_voter`
 *    - `precinct_no` → `voter_id_no`
 *    - `household_role` → stored in household_members_tbl, not residents_tbl
 * 4. Table display now uses DB-sourced data (resident_no, full name build, address build).
 * 5. Removed stray console.log() calls.
 * 6. Added proper loading and error states.
 * 7. Moved fetchResidents to useCallback to allow refresh button to work.
 */
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
import {
  fetchResidents,
  createResident,
  updateResident,
  archiveResident,
  deleteResident,
} from '../../../services/residentsService';
import { logAudit } from '../../../services/auditService';
import { useAuth } from '../../../core/AuthContext';
import { useToast } from '../../../core/ToastContext';

const PAGE_SIZE = 10;

/** Map raw DB row → shape consumed by ResidentTable */
function mapRow(r) {
  return {
    id: r.id,
    residentNo: r.resident_no ?? '—',
    name: [r.last_name, r.first_name, r.middle_name, r.suffix].filter(Boolean).join(', '),
    address: [r.house_no, r.street, r.barangay, r.city].filter(Boolean).join(', ') || '—',
    gender: r.gender ?? '—',
    birthdate: r.birthdate
      ? new Date(r.birthdate).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '—',
    contactNo: r.contact_number ?? '—',
    status: r.status ?? 'Active',
    // Keep the raw row for the edit modal
    _raw: r,
  };
}

export default function Residents() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedResident, setSelectedResident] = useState(null);
  const [residentToArchive, setResidentToArchive] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const loadResidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResidents();
      setResidents(data.map(mapRow));
    } catch (err) {
      setError('Failed to load residents. Please try again.');
      toast.error('Load Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents]);

  // Reset to page 1 when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  // ── Filtering & sorting ────────────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let list = residents;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.residentNo.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.gender.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'name-asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name-desc') list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === 'date-newest')
      list = [...list].sort(
        (a, b) => new Date(b._raw.birthdate ?? 0) - new Date(a._raw.birthdate ?? 0)
      );
    if (sortBy === 'date-oldest')
      list = [...list].sort(
        (a, b) => new Date(a._raw.birthdate ?? 0) - new Date(b._raw.birthdate ?? 0)
      );
    if (sortBy === 'status') list = [...list].sort((a, b) => a.status.localeCompare(b.status));

    return list;
  }, [residents, search, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedResidents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const actorId = userProfile?.id ?? null;

  const handleAddResident = async (formData) => {
    setSubmitting(true);
    try {
      const created = await createResident(formData, actorId);
      await logAudit({
        actorId,
        action: 'INSERT',
        targetTable: 'residents_tbl',
        targetId: created.id,
        description: `Added resident ${created.resident_no}`,
      });
      toast.success('Resident Added', `${created.resident_no} has been registered.`);
      setAddModalOpen(false);
      await loadResidents();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Add Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditResident = (resident) => {
    setSelectedResident(resident);
    setEditModalOpen(true);
  };

  const handleUpdateResident = async (formData) => {
    if (!selectedResident) return;
    setSubmitting(true);
    try {
      await updateResident(selectedResident.id, formData, actorId);
      await logAudit({
        actorId,
        action: 'UPDATE',
        targetTable: 'residents_tbl',
        targetId: selectedResident.id,
        description: `Updated resident ${selectedResident.residentNo}`,
      });
      toast.success('Resident Updated', 'The record has been updated.');
      setEditModalOpen(false);
      setSelectedResident(null);
      await loadResidents();
    } catch (err) {
      toast.error('Update Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveResident = (resident) => {
    setResidentToArchive(resident);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!residentToArchive) return;
    setSubmitting(true);
    try {
      await archiveResident(residentToArchive.id, actorId);
      await logAudit({
        actorId,
        action: 'ARCHIVE',
        targetTable: 'residents_tbl',
        targetId: residentToArchive.id,
        description: `Archived resident ${residentToArchive.residentNo}`,
      });
      toast.success('Resident Archived', 'The record has been archived.');
      setArchiveModalOpen(false);
      setResidentToArchive(null);
      // Optimistic removal
      setResidents((prev) => prev.filter((r) => r.id !== residentToArchive.id));
      setCurrentPage(1);
    } catch (err) {
      toast.error('Archive Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResident = (resident) => {
    setResidentToDelete(resident);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!residentToDelete) return;
    setSubmitting(true);
    try {
      await deleteResident(residentToDelete.id);
      await logAudit({
        actorId,
        action: 'DELETE',
        targetTable: 'residents_tbl',
        targetId: residentToDelete.id,
        description: `Deleted resident ${residentToDelete.residentNo}`,
      });
      toast.success('Resident Deleted', 'The record has been permanently deleted.');
      setDeleteModalOpen(false);
      setResidentToDelete(null);
      setResidents((prev) => prev.filter((r) => r.id !== residentToDelete.id));
      setCurrentPage(1);
    } catch (err) {
      toast.error('Delete Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto relative">
        <DashboardHeader title="Residents" />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-10 font-semibold text-[25px]">Resident List</h1>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
              >
                {error}
              </div>
            )}

            {/* Search, Sort, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <SearchBox value={search} onChange={setSearch} placeholder="Search residents..." />
                <div className="inline-flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadResidents}
                  disabled={loading}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? 'Loading…' : 'Refresh'}
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
              loading={loading}
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
          </div>
        </section>
      </main>

      {/* Modals */}
      <ResidentAddEdit
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddResident}
        mode="add"
        submitting={submitting}
      />

      <ResidentAddEdit
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedResident(null);
        }}
        onSubmit={handleUpdateResident}
        initialData={selectedResident?._raw}
        mode="edit"
        submitting={submitting}
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
        loading={submitting}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Resident"
        message="This record will be permanently deleted. This cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setResidentToDelete(null);
        }}
        loading={submitting}
      />
    </div>
  );
}