/**
 * Households.jsx
 *
 * Issues fixed vs. original:
 * 1. Removed all MOCK_HOUSEHOLDS — fetches real data from Supabase.
 * 2. handleAddHousehold/handleUpdateHousehold/handleConfirmArchive/handleConfirmDelete
 *    now call householdsService with correct DB column names.
 * 3. Head member name derived from household_members_tbl join (is_head=true).
 * 4. Removed stray console.log() calls.
 * 5. Added proper loading, error, and submitting states.
 * 6. Status filter operates on DB `is_active` flag.
 * 7. Sort by date uses `created_at` (UUIDs don't sort numerically).
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { HouseholdTable, HouseholdAddEdit } from '../components/households';
import {
  SortFilter,
  OrderFilter,
  Pagination,
  SearchBox,
  ArchiveModal,
  DeleteModal,
  StatusFilter,
} from '../../../shared';
import {
  fetchHouseholds,
  createHousehold,
  updateHousehold,
  archiveHousehold,
  deleteHousehold,
} from '../../../services/householdsService';
import { logAudit } from '../../../services/auditService';
import { useAuth } from '../../../core/AuthContext';
import { useToast } from '../../../core/ToastContext';

const PAGE_SIZE = 10;

/** Build a display-ready row from DB data */
function mapRow(h) {
  // Head member comes from the joined members array
  const headMember = h.members?.find((m) => m.is_head);
  const headName = headMember
    ? [
        headMember.residents_tbl?.last_name,
        headMember.residents_tbl?.first_name,
        headMember.residents_tbl?.suffix,
      ]
        .filter(Boolean)
        .join(', ')
    : '—';

  const address = [h.house_no, h.street, h.barangay, h.city].filter(Boolean).join(', ') || '—';
  const purokName = h.puroks_tbl?.name ?? '—';

  return {
    id: h.id,
    householdNo: h.household_no ?? '—',
    headMemberName: headName,
    purok: purokName,
    address,
    members: h.members ?? [],
    memberCount: (h.members ?? []).length,
    status: h.is_active ? 'Active' : 'Inactive',
    isArchived: h.is_archived,
    createdAt: h.created_at,
    _raw: h,
  };
}

export default function Households() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [householdToArchive, setHouseholdToArchive] = useState(null);
  const [householdToDelete, setHouseholdToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const loadHouseholds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHouseholds();
      setHouseholds(data.map(mapRow));
    } catch (err) {
      setError('Failed to load households. Please try again.');
      toast.error('Load Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHouseholds();
  }, [loadHouseholds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, statusFilter]);

  // ── Filtering & sorting ────────────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let list = households;

    if (statusFilter !== 'All') {
      list = list.filter((h) => h.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.householdNo.toLowerCase().includes(q) ||
          h.headMemberName.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.purok.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'name-asc')
      list = [...list].sort((a, b) => a.headMemberName.localeCompare(b.headMemberName));
    if (sortBy === 'name-desc')
      list = [...list].sort((a, b) => b.headMemberName.localeCompare(a.headMemberName));
    if (sortBy === 'date-newest')
      list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'date-oldest')
      list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === 'status')
      list = [...list].sort((a, b) => a.status.localeCompare(b.status));

    return list;
  }, [households, search, sortBy, statusFilter]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedHouseholds = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const actorId = userProfile?.id ?? null;

  const handleAddHousehold = async (formData) => {
    setSubmitting(true);
    try {
      const created = await createHousehold(formData, actorId);
      await logAudit({
        actorId,
        action: 'INSERT',
        targetTable: 'households_tbl',
        targetId: created.id,
        description: `Added household ${created.household_no}`,
      });
      toast.success('Household Added', `${created.household_no} has been registered.`);
      setAddModalOpen(false);
      await loadHouseholds();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Add Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditHousehold = (household) => {
    setSelectedHousehold(household);
    setEditModalOpen(true);
  };

  const handleUpdateHousehold = async (formData) => {
    if (!selectedHousehold) return;
    setSubmitting(true);
    try {
      await updateHousehold(selectedHousehold.id, formData, actorId);
      await logAudit({
        actorId,
        action: 'UPDATE',
        targetTable: 'households_tbl',
        targetId: selectedHousehold.id,
        description: `Updated household ${selectedHousehold.householdNo}`,
      });
      toast.success('Household Updated', 'The record has been updated.');
      setEditModalOpen(false);
      setSelectedHousehold(null);
      await loadHouseholds();
    } catch (err) {
      toast.error('Update Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveHousehold = (household) => {
    setHouseholdToArchive(household);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!householdToArchive) return;
    setSubmitting(true);
    try {
      await archiveHousehold(householdToArchive.id, actorId);
      await logAudit({
        actorId,
        action: 'ARCHIVE',
        targetTable: 'households_tbl',
        targetId: householdToArchive.id,
        description: `Archived household ${householdToArchive.householdNo}`,
      });
      toast.success('Household Archived', 'The record has been archived.');
      setArchiveModalOpen(false);
      setHouseholdToArchive(null);
      setHouseholds((prev) => prev.filter((h) => h.id !== householdToArchive.id));
      setCurrentPage(1);
    } catch (err) {
      toast.error('Archive Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHousehold = (household) => {
    setHouseholdToDelete(household);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!householdToDelete) return;
    setSubmitting(true);
    try {
      await deleteHousehold(householdToDelete.id);
      await logAudit({
        actorId,
        action: 'DELETE',
        targetTable: 'households_tbl',
        targetId: householdToDelete.id,
        description: `Deleted household ${householdToDelete.householdNo}`,
      });
      toast.success('Household Deleted', 'The record has been permanently deleted.');
      setDeleteModalOpen(false);
      setHouseholdToDelete(null);
      setHouseholds((prev) => prev.filter((h) => h.id !== householdToDelete.id));
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
        <DashboardHeader title="Households" />

        <section className="px-5 py-7">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="mb-10 font-semibold text-[25px]">Household List</h1>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"
              >
                {error}
              </div>
            )}

            {/* Search, Sort, Filter, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <SearchBox value={search} onChange={setSearch} placeholder="Search households..." />
                <div className="inline-flex items-center gap-2">
                  <SortFilter value={sortBy} onChange={setSortBy} />
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                </div>
                <StatusFilter value={statusFilter} onChange={setStatusFilter} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadHouseholds}
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
                  Add New Household
                </button>
              </div>
            </div>

            {/* Table */}
            <HouseholdTable
              households={paginatedHouseholds}
              loading={loading}
              onEditHousehold={handleEditHousehold}
              onArchiveHousehold={handleArchiveHousehold}
              onDeleteHousehold={handleDeleteHousehold}
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
      <HouseholdAddEdit
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddHousehold}
        mode="add"
        submitting={submitting}
      />

      <HouseholdAddEdit
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedHousehold(null);
        }}
        onSubmit={handleUpdateHousehold}
        initialData={selectedHousehold?._raw}
        mode="edit"
        submitting={submitting}
      />

      <ArchiveModal
        isOpen={archiveModalOpen}
        title="Household"
        message="This record will be archived and removed from the active list."
        onConfirm={handleConfirmArchive}
        onCancel={() => {
          setArchiveModalOpen(false);
          setHouseholdToArchive(null);
        }}
        loading={submitting}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Household"
        message="This record will be permanently deleted. This cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setHouseholdToDelete(null);
        }}
        loading={submitting}
      />
    </div>
  );
}