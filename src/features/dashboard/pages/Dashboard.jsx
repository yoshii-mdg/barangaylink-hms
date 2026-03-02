import { useEffect, useState, useCallback } from 'react';
import { FiHome, FiRefreshCw } from 'react-icons/fi';
import { FaRegAddressCard } from 'react-icons/fa';
import { PiUsersThree } from 'react-icons/pi';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { supabase } from '../../../core/supabase';
import { useAuth, ROLES } from '../../../core/AuthContext';

// ── Skeleton ─────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, loading, color = 'green' }) {
  const palette = {
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-100'    },
    amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100'   },
    purple: { bg: 'bg-purple-50',  icon: 'text-purple-600',  border: 'border-purple-100'  },
  };
  const c = palette[color] ?? palette.green;

  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-20 mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString() ?? '—'}</p>
        )}
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active:      'bg-emerald-100 text-emerald-800',
    Inactive:    'bg-gray-100 text-gray-600',
    Pending:     'bg-amber-100 text-amber-800',
    Deactivated: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status ?? 'Active'}
    </span>
  );
}

// ── Activity icon ─────────────────────────────────────────────────────────
function ActivityIcon({ type }) {
  const map = {
    resident:     { icon: PiUsersThree,              bg: 'bg-green-50',  color: 'text-green-600'  },
    household:    { icon: FiHome,                    bg: 'bg-blue-50',   color: 'text-blue-600'   },
    eid:          { icon: FaRegAddressCard,           bg: 'bg-purple-50', color: 'text-purple-600' },
    verification: { icon: IoShieldCheckmarkOutline,  bg: 'bg-amber-50',  color: 'text-amber-600'  },
    default:      { icon: HiOutlineDocumentText,     bg: 'bg-gray-50',   color: 'text-gray-500'   },
  };
  const { icon: Icon, bg, color } = map[type] ?? map.default;
  return (
    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function tableToType(table) {
  if (!table) return 'default';
  if (table.includes('resident')) return 'resident';
  if (table.includes('household')) return 'household';
  if (table.includes('eid')) return 'eid';
  if (table.includes('verification')) return 'verification';
  return 'default';
}

// ══════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { userRole } = useAuth();
  const isResident = userRole === ROLES.RESIDENT;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats]               = useState({ totalResidents: null, totalHouseholds: null, activeEID: null, pendingEID: null });
  const [recentResidents, setRecentResidents] = useState([]);
  const [recentActivity, setRecentActivity]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [
        residentsRes,
        householdsRes,
        recentResRes,
        activityRes,
        eidActiveRes,
        eidPendingRes,
      ] = await Promise.all([
        supabase.from('residents_tbl').select('*', { count: 'exact', head: true }),
        supabase.from('households_tbl').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('residents_tbl')
          .select('id, first_name, middle_name, last_name, suffix, gender, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('audit_logs_tbl')
          .select('id, action, target_table, created_at')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('eid_tbl').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('eid_tbl').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      ]);

      setStats({
        totalResidents:  residentsRes.count  ?? 0,
        totalHouseholds: householdsRes.count ?? 0,
        activeEID:       eidActiveRes.error  ? 0 : (eidActiveRes.count  ?? 0),
        pendingEID:      eidPendingRes.error ? 0 : (eidPendingRes.count ?? 0),
      });

      setRecentResidents(
        (recentResRes.data ?? []).map((r) => ({
          id: r.id,
          name: [r.first_name, r.middle_name, r.last_name, r.suffix].filter(Boolean).join(' '),
          gender: r.gender ?? '—',
          status: r.status ?? 'Active',
          date: r.created_at
            ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
        }))
      );

      setRecentActivity(
        (activityRes.data ?? []).map((a) => ({
          id:    a.id,
          title: a.action
            ? `${a.action.charAt(0).toUpperCase() + a.action.slice(1)} — ${(a.target_table ?? '').replace('_tbl', '').replace(/_/g, ' ')}`
            : 'System activity',
          time:  timeAgo(a.created_at),
          type:  tableToType(a.target_table),
        }))
      );
    } catch {
      setError('Failed to load dashboard. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="Dashboard" onMenuToggle={() => setSidebarOpen((o) => !o)} />

        <section className="px-5 py-7 space-y-6">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center justify-between text-sm">
              <span>{error}</span>
              <button type="button" onClick={fetchDashboard} className="flex items-center gap-1.5 font-medium hover:text-red-900">
                <FiRefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          )}

          {/* Stat Cards (staff/admin only) */}
          {!isResident && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={PiUsersThree}            label="Total Residents"   value={stats.totalResidents}  loading={loading} color="green"  />
              <StatCard icon={FiHome}                  label="Active Households" value={stats.totalHouseholds} loading={loading} color="blue"   />
              <StatCard icon={FaRegAddressCard}         label="Active eIDs"       value={stats.activeEID}       loading={loading} color="purple" />
              <StatCard icon={IoShieldCheckmarkOutline} label="Pending eIDs"      value={stats.pendingEID}      loading={loading} color="amber"  />
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Recent Residents */}
            {!isResident && (
              <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Recent Residents</h2>
                  <button type="button" onClick={fetchDashboard}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors" aria-label="Refresh">
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                        <th className="py-3 px-6 text-left font-medium">Name</th>
                        <th className="py-3 px-4 text-left font-medium">Gender</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-3 px-6"><Skeleton className="h-4 w-36" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-14" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                            <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                          </tr>
                        ))
                      ) : recentResidents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                            No residents registered yet.
                          </td>
                        </tr>
                      ) : (
                        recentResidents.map((r) => (
                          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                            <td className="py-3 px-6 text-sm font-medium text-gray-800">{r.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{r.gender}</td>
                            <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                            <td className="py-3 px-4 text-xs text-gray-500">{r.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${isResident ? 'xl:col-span-3' : ''}`}>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-5 space-y-3">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : recentActivity.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-sm">
                    <HiOutlineDocumentText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No activity recorded yet.
                  </div>
                ) : (
                  recentActivity.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <ActivityIcon type={a.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 capitalize leading-snug">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Summary footer */}
          {!isResident && !loading && !error && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5">
              <h2 className="font-semibold text-gray-900 mb-4">System Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Total Residents',   value: stats.totalResidents  },
                  { label: 'Active Households', value: stats.totalHouseholds },
                  { label: 'Active eIDs',       value: stats.activeEID       },
                  { label: 'Pending eIDs',      value: stats.pendingEID      },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-gray-100 rounded-xl py-4 px-2">
                    <p className="text-2xl font-bold text-[#005F02]">{value?.toLocaleString() ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}