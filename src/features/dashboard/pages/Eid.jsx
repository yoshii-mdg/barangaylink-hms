import { useMemo, useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { EidOverview, EidCard, EidAddEditModal } from '../components/EId';
import {
  SearchBox,
  SortFilter,
  OrderFilter,
  Pagination,
  DeactiveModal,
  DeleteModal,
} from '../../../shared';

const PAGE_SIZE = 6;

const MOCK_EIDS = [
  {
    id: 1,
    idNumber: '1234-123-12',
    name: 'Eloise Bridgerton',
    address: '#81 St. Brgy. San Bartolome',
    status: 'Active',
    issuedAt: '2024-01-15',
  },
  {
    id: 2,
    idNumber: '1234-123-13',
    name: 'John Doe',
    address: 'Dahlia Avenue St.',
    status: 'Active',
    issuedAt: '2024-02-10',
  },
  {
    id: 3,
    idNumber: '1234-123-14',
    name: 'Jane Smith',
    address: 'Maple Street',
    status: 'Pending',
    issuedAt: '2024-03-05',
  },
  {
    id: 4,
    idNumber: '1234-123-15',
    name: 'Carlos Reyes',
    address: 'Purok 2, San Bartolome',
    status: 'Deactivated',
    issuedAt: '2023-11-20',
  },
  {
    id: 5,
    idNumber: '1234-123-16',
    name: 'Maria Santos',
    address: 'Rose Avenue',
    status: 'Active',
    issuedAt: '2024-01-02',
  },
  {
    id: 6,
    idNumber: '1234-123-17',
    name: 'Liam Garcia',
    address: 'Purok 4, San Bartolome',
    status: 'Pending',
    issuedAt: '2024-04-01',
  },
  {
    id: 7,
    idNumber: '1234-123-18',
    name: 'Olivia Cruz',
    address: 'Dahlia Avenue St.',
    status: 'Active',
    issuedAt: '2024-02-25',
  },
  {
    id: 8,
    idNumber: '1234-123-19',
    name: 'Noah Villanueva',
    address: 'Sunflower Street',
    status: 'Deactivated',
    issuedAt: '2023-10-10',
  },
  {
    id: 9,
    idNumber: '1234-123-20',
    name: 'Emma Flores',
    address: 'Purok 1, San Bartolome',
    status: 'Active',
    issuedAt: '2024-03-18',
  },
  {
    id: 10,
    idNumber: '1234-123-21',
    name: 'James Lee',
    address: 'Oak Street',
    status: 'Pending',
    issuedAt: '2024-04-05',
  },
  {
    id: 11,
    idNumber: '1234-123-22',
    name: 'Sophia Kim',
    address: 'Dahlia Avenue St.',
    status: 'Active',
    issuedAt: '2024-01-28',
  },
  {
    id: 12,
    idNumber: '1234-123-23',
    name: 'Daniel Cruz',
    address: 'Purok 3, San Bartolome',
    status: 'Deactivated',
    issuedAt: '2023-09-15',
  },
];

export default function Eid() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [eids, setEids] = useState(MOCK_EIDS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEid, setSelectedEid] = useState(null);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eidFormModalOpen, setEidFormModalOpen] = useState(false);
  const [eidFormMode, setEidFormMode] = useState('create');

  const stats = useMemo(() => {
    const total = eids.length;
    const active = eids.filter((e) => e.status === 'Active').length;
    const pending = eids.filter((e) => e.status === 'Pending').length;
    const deactivated = eids.filter(
      (e) => e.status === 'Deactivated',
    ).length;

    return { total, active, pending, deactivated };
  }, [eids]);

  const filteredAndSorted = useMemo(() => {
    let list = eids.filter((eid) => {
      const matchesSearch =
        !search ||
        eid.name?.toLowerCase().includes(search.toLowerCase()) ||
        eid.idNumber?.includes(search) ||
        eid.address?.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });

    if (sortBy === 'name-asc') {
      list = [...list].sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? ''),
      );
    }
    if (sortBy === 'name-desc') {
      list = [...list].sort((a, b) =>
        (b.name ?? '').localeCompare(a.name ?? ''),
      );
    }
    if (sortBy === 'date-newest') {
      list = [...list].sort(
        (a, b) =>
          new Date(b.issuedAt ?? 0) - new Date(a.issuedAt ?? 0),
      );
    }
    if (sortBy === 'date-oldest') {
      list = [...list].sort(
        (a, b) =>
          new Date(a.issuedAt ?? 0) - new Date(b.issuedAt ?? 0),
      );
    }
    if (sortBy === 'status') {
      list = [...list].sort((a, b) =>
        (a.status ?? '').localeCompare(b.status ?? ''),
      );
    }

    return list;
  }, [search, sortBy, eids]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedEids = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const handleEditEid = (eid) => {
    setSelectedEid(eid);
    setEidFormMode('edit');
    setEidFormModalOpen(true);
  };

  const handleCreateEid = () => {
    setSelectedEid(null);
    setEidFormMode('create');
    setEidFormModalOpen(true);
  };

  const handleSubmitEid = (formData) => {
    if (eidFormMode === 'create') {
      const newEid = {
        id: Math.max(...eids.map((e) => e.id), 0) + 1,
        idNumber: formData.idNumber,
        name: formData.name,
        address: formData.address ?? '',
        status: 'Pending',
        issuedAt: new Date().toISOString().slice(0, 10),
      };
      setEids((prev) => [newEid, ...prev]);
    } else if (selectedEid) {
      setEids((prev) =>
        prev.map((e) =>
          e.id === selectedEid.id
            ? {
              ...e,
              idNumber: formData.idNumber,
              name: formData.name,
              address: formData.address ?? e.address,
            }
            : e
        )
      );
    }
    setEidFormModalOpen(false);
    setSelectedEid(null);
  };

  const handleDeactivateEid = (eid) => {
    setSelectedEid(eid);
    setDeactivateModalOpen(true);
  };

  const handleDeleteEid = (eid) => {
    setSelectedEid(eid);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    if (selectedEid) {
      setEids((prev) =>
        prev.map((e) =>
          e.id === selectedEid.id ? { ...e, status: 'Deactivated' } : e,
        ),
      );
    }
    setDeactivateModalOpen(false);
    setSelectedEid(null);
  };

  const handleConfirmDelete = () => {
    if (selectedEid) {
      setEids((prev) => prev.filter((e) => e.id !== selectedEid.id));
      setCurrentPage(1);
    }
    setDeleteModalOpen(false);
    setSelectedEid(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="eID" onMenuToggle={() => setSidebarOpen(o => !o)} />

        <section className="px-5 py-7">
          <EidOverview stats={stats} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <OrderFilter value={sortBy} onChange={setSortBy} />
                  <SortFilter value={sortBy} onChange={setSortBy} />
                </div>
                <SearchBox
                  value={search}
                  onChange={(value) => {
                    setSearch(value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search eID"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handleCreateEid}
                  className="inline-flex justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01] transition-colors"
                >
                  Create New eID
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedEids.map((eid) => (
                <EidCard
                  key={eid.id}
                  eid={eid}
                  onEdit={handleEditEid}
                  onDeactivate={handleDeactivateEid}
                  onDelete={handleDeleteEid}
                />
              ))}
            </div>

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

      <EidAddEditModal
        isOpen={eidFormModalOpen}
        onClose={() => {
          setEidFormModalOpen(false);
          setSelectedEid(null);
        }}
        onSubmit={handleSubmitEid}
        initialData={selectedEid}
        mode={eidFormMode}
      />

      <DeactiveModal
        isOpen={deactivateModalOpen}
        title="eID"
        message="This action is permanent and cannot be undone."
        onConfirm={handleConfirmDeactivate}
        onCancel={() => {
          setDeactivateModalOpen(false);
          setSelectedEid(null);
        }}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        title="eID"
        message="This action is permanent and cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedEid(null);
        }}
      />
    </div>
  );
}

