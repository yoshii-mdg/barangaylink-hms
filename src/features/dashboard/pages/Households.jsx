import { useState, useMemo, useEffect, useCallback } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import {
    HouseholdTable,
    HouseholdAddEdit,
} from '../components/households';
import { SortFilter, OrderFilter, StatusFilter, Pagination, SearchBox, ArchiveModal, DeleteModal } from '../../../shared';
import { supabase } from '../../../core/supabase';

const PAGE_SIZE = 8;

export default function Households() {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedHousehold, setSelectedHousehold] = useState(null);
    const [householdToArchive, setHouseholdToArchive] = useState(null);
    const [householdToDelete, setHouseholdToDelete] = useState(null);
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ── Fetch from Supabase ────────────────────────────────────────────────────
    // households_tbl columns: id, household_no, house_no, street, purok, barangay,
    // city, province, house_type, notes, is_active, registered_by, created_at, updated_at
    // Head member name comes from residents_tbl via household_role = 'Head'
    const fetchHouseholds = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error: fetchErr } = await supabase
                .from('households_tbl')
                .select(`
                    id,
                    household_no,
                    house_no,
                    street,
                    purok,
                    barangay,
                    city,
                    province,
                    house_type,
                    notes,
                    is_active,
                    created_at
                `)
                .order('created_at', { ascending: false });

            if (fetchErr) throw fetchErr;

            // For each household, count members and get head name from residents_tbl
            const householdIds = (data ?? []).map((h) => h.id);

            let residentRows = [];
            if (householdIds.length > 0) {
                const { data: resData } = await supabase
                    .from('residents_tbl')
                    .select('id, household_id, first_name, middle_name, last_name, suffix, household_role, contact_number')
                    .in('household_id', householdIds);
                residentRows = resData ?? [];
            }

            setHouseholds(
                (data ?? []).map((h) => {
                    const members = residentRows.filter((r) => r.household_id === h.id);
                    const head = members.find((r) => r.household_role?.toLowerCase() === 'head');
                    const headName = head
                        ? [head.last_name, head.first_name, head.middle_name, head.suffix].filter(Boolean).join(', ')
                        : '—';
                    const address = [h.house_no, h.street, h.purok, h.barangay, h.city, h.province]
                        .filter(Boolean)
                        .join(', ') || '—';

                    return {
                        id: h.id,
                        householdNo: h.household_no ?? '—',
                        headMemberName: headName,
                        address,
                        houseNo: h.house_no ?? '',
                        street: h.street ?? '',
                        purok: h.purok ?? '',
                        barangay: h.barangay ?? '',
                        city: h.city ?? '',
                        province: h.province ?? '',
                        houseType: h.house_type ?? '',
                        notes: h.notes ?? '',
                        members: members.length,
                        // is_active boolean → map to 'Active' / 'Inactive' string for UI
                        status: h.is_active === false ? 'Inactive' : 'Active',
                        isActive: h.is_active !== false,
                    };
                })
            );
        } catch (err) {
            setError(err.message || 'Failed to load households.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchHouseholds(); }, [fetchHouseholds]);

    // ── Filter + Sort ──────────────────────────────────────────────────────────
    const filteredAndSorted = useMemo(() => {
        let list = households.filter((h) => {
            const matchesSearch =
                !search ||
                h.householdNo?.toLowerCase().includes(search.toLowerCase()) ||
                h.headMemberName?.toLowerCase().includes(search.toLowerCase()) ||
                h.address?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && h.status === 'Active') ||
                (statusFilter === 'inactive' && h.status === 'Inactive');

            return matchesSearch && matchesStatus;
        });

        if (sortBy === 'name-asc') list = [...list].sort((a, b) => (a.headMemberName ?? '').localeCompare(b.headMemberName ?? ''));
        if (sortBy === 'name-desc') list = [...list].sort((a, b) => (b.headMemberName ?? '').localeCompare(a.headMemberName ?? ''));
        if (sortBy === 'date-newest') list = [...list].sort((a, b) => new Date(b.id) - new Date(a.id));
        if (sortBy === 'date-oldest') list = [...list].sort((a, b) => new Date(a.id) - new Date(b.id));
        if (sortBy === 'status') list = [...list].sort((a, b) => (a.status ?? '').localeCompare(b.status ?? ''));

        return list;
    }, [households, search, sortBy, statusFilter]);

    const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
    const paginatedHouseholds = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAndSorted.slice(start, start + PAGE_SIZE);
    }, [filteredAndSorted, currentPage]);

    // ── Mutations ──────────────────────────────────────────────────────────────
    const handleAddHousehold = async (data) => {
        const { error: insertErr } = await supabase.from('households_tbl').insert({
            household_no: data.householdNo || null,
            house_no: data.houseNo || null,
            street: data.street || null,
            purok: data.purok || null,
            barangay: data.barangay || null,
            city: data.city || null,
            province: data.province || null,
            house_type: data.houseType || null,
            notes: data.notes || null,
            is_active: true,
        });
        if (insertErr) throw insertErr;
        await fetchHouseholds();
        setCurrentPage(1);
    };

    const handleEditHousehold = (household) => {
        setSelectedHousehold(household);
        setEditModalOpen(true);
    };

    const handleUpdateHousehold = async (data) => {
        if (!selectedHousehold) return;
        const { error: updateErr } = await supabase
            .from('households_tbl')
            .update({
                household_no: data.householdNo || selectedHousehold.householdNo,
                house_no: data.houseNo || null,
                street: data.street || null,
                purok: data.purok || null,
                barangay: data.barangay || null,
                city: data.city || null,
                province: data.province || null,
                house_type: data.houseType || null,
                notes: data.notes || null,
            })
            .eq('id', selectedHousehold.id);

        if (updateErr) throw updateErr;
        await fetchHouseholds();
        setSelectedHousehold(null);
    };

    const handleArchiveHousehold = (household) => {
        setHouseholdToArchive(household);
        setArchiveModalOpen(true);
    };

    const handleDeleteHousehold = (household) => {
        setHouseholdToDelete(household);
        setDeleteModalOpen(true);
    };

    const handleConfirmArchive = async () => {
        if (!householdToArchive) return;
        try {
            const { error: updateErr } = await supabase
                .from('households_tbl')
                .update({ is_active: false })
                .eq('id', householdToArchive.id);
            if (updateErr) throw updateErr;
            await fetchHouseholds();
        } catch (err) {
            console.error('Archive household error:', err);
        } finally {
            setArchiveModalOpen(false);
            setHouseholdToArchive(null);
            setCurrentPage(1);
        }
    };

    const handleConfirmDelete = async () => {
        if (!householdToDelete) return;
        try {
            const { error: deleteErr } = await supabase
                .from('households_tbl')
                .delete()
                .eq('id', householdToDelete.id);
            if (deleteErr) throw deleteErr;
            await fetchHouseholds();
        } catch (err) {
            console.error('Delete household error:', err);
        } finally {
            setDeleteModalOpen(false);
            setHouseholdToDelete(null);
            setCurrentPage(1);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F3F7F3]">
            <DashboardSidebar />

            <main className="flex-1 overflow-auto relative">
                <DashboardHeader title="Household" />

                <section className="px-5 py-7">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h1 className="mb-6 font-semibold text-[25px]">Household List</h1>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3 flex-wrap">
                                <SearchBox
                                    value={search}
                                    onChange={(v) => { setSearch(v); setCurrentPage(1); }}
                                    placeholder="Search households…"
                                />
                                <SortFilter value={sortBy} onChange={setSortBy} />
                                <StatusFilter value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} />
                                <OrderFilter value={sortBy} onChange={setSortBy} />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fetchHouseholds()}
                                    className="px-3 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                    Refresh
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

                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                                ))}
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
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
                message="This household will be marked as Inactive and hidden from active records."
                onConfirm={handleConfirmArchive}
                onCancel={() => { setArchiveModalOpen(false); setHouseholdToArchive(null); }}
            />

            <DeleteModal
                isOpen={deleteModalOpen}
                title="Household"
                message="This record will be permanently deleted and cannot be recovered."
                onConfirm={handleConfirmDelete}
                onCancel={() => { setDeleteModalOpen(false); setHouseholdToDelete(null); }}
            />
        </div>
    );
}