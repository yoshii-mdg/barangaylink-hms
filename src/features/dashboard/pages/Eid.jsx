import { useMemo, useState, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { EidOverview, EidCard, EidAddEditModal } from '../components/eid';
import {
  SearchBox,
  SortFilter,
  OrderFilter,
  Pagination,
  DeactiveModal,
  DeleteModal,
} from '../../../shared';
import { supabase } from '../../../core/supabase';
import { useToast } from '../../../core/ToastContext';
import { useAuth, ROLES } from '../../../core/AuthContext';
import { FiRefreshCw } from 'react-icons/fi';

const PAGE_SIZE = 6;

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ══════════════════════════════════════════════════════════════════════════
export default function Eid() {
  const toast    = useToast();
  const { userRole, user } = useAuth();
  const isResident = userRole === ROLES.RESIDENT;

  const [eids, setEids]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('date-newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedEid, setSelectedEid]                 = useState(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen]         = useState(false);
  const [eidFormModalOpen, setEidFormModalOpen]       = useState(false);
  const [eidFormMode, setEidFormMode]                 = useState('create');

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchEids = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let query = supabase
        .from('eid_tbl')
        .select(`
          id, id_number, first_name, middle_name, last_name, suffix,
          address, birthdate, gender, contact_number, email_address,
          photo_url, qr_code, status, created_at, resident_id
        `)
        .order('created_at', { ascending: false });

      // Residents only see their own eID
      if (isResident && user?.id) {
        query = query.eq('resident_id', user.id);
      }

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      setEids(
        (data ?? []).map((e) => ({
          id:            e.id,
          idNumber:      e.id_number ?? '—',
          name:          [e.first_name, e.middle_name, e.last_name, e.suffix].filter(Boolean).join(' '),
          firstName:     e.first_name ?? '',
          middleName:    e.middle_name ?? '',
          lastName:      e.last_name ?? '',
          suffix:        e.suffix ?? '',
          address:       e.address ?? '',
          birthdate:     e.birthdate ?? '',
          gender:        e.gender ?? '',
          contactNumber: e.contact_number ?? '',
          emailAddress:  e.email_address ?? '',
          photoUrl:      e.photo_url ?? null,
          qrCode:        e.qr_code ?? null,
          status:        e.status ?? 'Pending',
          issuedAt:      e.created_at ?? null,
          residentId:    e.resident_id ?? null,
        }))
      );
    } catch (err) {
      setError(err.message ?? 'Failed to load eIDs.');
    } finally {
      setLoading(false);
    }
  }, [isResident, user?.id]);

  useEffect(() => { fetchEids(); }, [fetchEids]);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       eids.length,
    active:      eids.filter((e) => e.status === 'Active').length,
    pending:     eids.filter((e) => e.status === 'Pending').length,
    deactivated: eids.filter((e) => e.status === 'Deactivated').length,
  }), [eids]);

  // ── Filter + sort ──────────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let list = eids.filter((e) =>
      !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.idNumber?.includes(search) ||
      e.address?.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'name-asc')    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'name-desc')   list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === 'date-newest') list = [...list].sort((a, b) => new Date(b.issuedAt ?? 0) - new Date(a.issuedAt ?? 0));
    if (sortBy === 'date-oldest') list = [...list].sort((a, b) => new Date(a.issuedAt ?? 0) - new Date(b.issuedAt ?? 0));
    if (sortBy === 'status')      list = [...list].sort((a, b) => a.status.localeCompare(b.status));

    return list;
  }, [eids, search, sortBy]);

  const totalPages    = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedEids = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleCreateEid = () => {
    setSelectedEid(null);
    setEidFormMode('create');
    setEidFormModalOpen(true);
  };

  const handleEditEid = (eid) => {
    setSelectedEid(eid);
    setEidFormMode('edit');
    setEidFormModalOpen(true);
  };

  const handleDeactivateEid   = (eid) => { setSelectedEid(eid); setDeactivateModalOpen(true); };
  const handleDeleteEid       = (eid) => { setSelectedEid(eid); setDeleteModalOpen(true); };

  const handleSubmitEid = async (formData) => {
    setActionLoading(true);
    try {
      const payload = {
        id_number:      formData.idNumber      || null,
        first_name:     formData.firstName     || null,
        middle_name:    formData.middleName    || null,
        last_name:      formData.lastName      || null,
        suffix:         formData.suffix        || null,
        address:        formData.address       || null,
        birthdate:      formData.birthdate     || null,
        gender:         formData.gender        || null,
        contact_number: formData.contactNumber || null,
        email_address:  formData.emailAddress  || null,
        // photo_url would be stored via Supabase Storage in production
      };

      if (eidFormMode === 'create') {
        payload.status      = 'Pending';
        payload.resident_id = user?.id ?? null;

        const { data, error: insertErr } = await supabase
          .from('eid_tbl')
          .insert(payload)
          .select()
          .single();

        if (insertErr) throw insertErr;
        toast.success('eID Created', `${formData.name || 'New eID'} has been added.`);
        await fetchEids();
        setCurrentPage(1);
      } else if (selectedEid) {
        const { error: updateErr } = await supabase
          .from('eid_tbl')
          .update(payload)
          .eq('id', selectedEid.id);

        if (updateErr) throw updateErr;
        toast.success('eID Updated', 'Changes saved successfully.');
        await fetchEids();
      }
    } catch (err) {
      toast.error('Error', err.message ?? 'Operation failed.');
    } finally {
      setActionLoading(false);
      setEidFormModalOpen(false);
      setSelectedEid(null);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedEid) return;
    setActionLoading(true);
    try {
      const { error: err } = await supabase
        .from('eid_tbl')
        .update({ status: 'Deactivated' })
        .eq('id', selectedEid.id);
      if (err) throw err;
      toast.success('eID Deactivated', `${selectedEid.name}'s eID has been deactivated.`);
      await fetchEids();
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setActionLoading(false);
      setDeactivateModalOpen(false);
      setSelectedEid(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEid) return;
    setActionLoading(true);
    try {
      const { error: err } = await supabase
        .from('eid_tbl')
        .delete()
        .eq('id', selectedEid.id);
      if (err) throw err;
      toast.success('eID Deleted', 'The eID has been permanently removed.');
      setCurrentPage(1);
      await fetchEids();
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
      setSelectedEid(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="eID" onMenuToggle={() => setSidebarOpen((o) => !o)} />

        <section className="px-5 py-7">
          {!isResident && <EidOverview stats={stats} />}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
                <span>{error}</span>
                <button type="button" onClick={fetchEids} className="flex items-center gap-1 font-medium">
                  <FiRefreshCw className="w-4 h-4" /> Retry
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <OrderFilter value={sortBy} onChange={(v) => { setSortBy(v); setCurrentPage(1); }} />
                  <SortFilter  value={sortBy} onChange={(v) => { setSortBy(v); setCurrentPage(1); }} />
                </div>
                <SearchBox
                  value={search}
                  onChange={(v) => { setSearch(v); setCurrentPage(1); }}
                  placeholder="Search eID"
                />
              </div>

              {!isResident && (
                <button
                  type="button"
                  onClick={handleCreateEid}
                  disabled={actionLoading}
                  className="inline-flex justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] disabled:opacity-60 transition-colors"
                >
                  Create New eID
                </button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[180px] rounded-lg" />
                ))}
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-lg font-medium">No eIDs found.</p>
                <p className="text-sm mt-1">
                  {search ? 'Try a different search.' : 'Create the first eID to get started.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEids.map((eid) => (
                  <EidCard
                    key={eid.id}
                    eid={eid}
                    onEdit={isResident ? undefined : handleEditEid}
                    onDeactivate={isResident ? undefined : handleDeactivateEid}
                    onDelete={isResident ? undefined : handleDeleteEid}
                  />
                ))}
              </div>
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
      {!isResident && (
        <>
          <EidAddEditModal
            isOpen={eidFormModalOpen}
            onClose={() => { setEidFormModalOpen(false); setSelectedEid(null); }}
            onSubmit={handleSubmitEid}
            initialData={selectedEid}
            mode={eidFormMode}
          />

          <DeactiveModal
            isOpen={deactivateModalOpen}
            title="eID"
            message="The eID will be deactivated and cannot be used for verification until reactivated."
            onConfirm={handleConfirmDeactivate}
            onCancel={() => { setDeactivateModalOpen(false); setSelectedEid(null); }}
          />

          <DeleteModal
            isOpen={deleteModalOpen}
            title="eID"
            message="This action is permanent and cannot be undone. The eID will be deleted."
            onConfirm={handleConfirmDelete}
            onCancel={() => { setDeleteModalOpen(false); setSelectedEid(null); }}
          />
        </>
      )}
    </div>
  );
}