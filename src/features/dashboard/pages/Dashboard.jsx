import { useEffect, useState } from 'react';
import { FiHome } from 'react-icons/fi';
import { FaRegAddressCard } from "react-icons/fa";
import { PiUsersThree } from "react-icons/pi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { supabase } from '../../../core/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalResidents: null,
    totalHouseholds: null,
    activeEID: null,
  });
  const [recentResidents, setRecentResidents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [
          residentsCountResult,
          householdsCountResult,
          activeEIDResult,
          recentResidentsResult,
          recentActivityResult,
        ] = await Promise.all([
          // Total residents — residents_tbl uses `id` as PK
          supabase
            .from('residents_tbl')
            .select('*', { count: 'exact', head: true }),

          // Total households — households_tbl uses `id` as PK, is_active for status
          supabase
            .from('households_tbl')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true),

          // Active eID — adjust table/column name if your eid table differs
          supabase
            .from('eid_tbl')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Active'),

          // Recent 5 residents — columns: id, first_name, middle_name, last_name,
          // gender, house_no/street/purok/barangay come from joining households_tbl
          // but for simplicity we show what's directly on the resident row
          supabase
            .from('residents_tbl')
            .select('id, first_name, middle_name, last_name, suffix, gender, created_at')
            .order('created_at', { ascending: false })
            .limit(5),

          // Activity log — audit_logs_tbl columns: id, actor_id, action, target_table, created_at
          supabase
            .from('audit_logs_tbl')
            .select('id, action, target_table, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        setStats({
          totalResidents: residentsCountResult.count ?? 0,
          totalHouseholds: householdsCountResult.count ?? 0,
          // If eid_tbl doesn't exist yet, gracefully fall back to 0
          activeEID: activeEIDResult.error ? 0 : (activeEIDResult.count ?? 0),
        });

        if (recentResidentsResult.data) {
          setRecentResidents(recentResidentsResult.data.map((r) => ({
            name: [r.last_name, r.first_name, r.middle_name, r.suffix]
              .filter(Boolean)
              .join(', '),
            gender: r.gender ?? '—',
            dateRegistered: r.created_at
              ? new Date(r.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })
              : '—',
          })));
        }

        if (recentActivityResult.data && recentActivityResult.data.length > 0) {
          setRecentActivity(recentActivityResult.data.map((a) => ({
            title: formatAction(a.action, a.target_table),
            time: timeAgo(a.created_at),
            type: tableToType(a.target_table),
          })));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  function formatAction(action, table) {
    if (!action) return 'System activity recorded';
    const tableLabel = table ? table.replace('_tbl', '').replace(/_/g, ' ') : '';
    return `${action}${tableLabel ? ` on ${tableLabel}` : ''}`;
  }

  function tableToType(table) {
    if (!table) return 'default';
    if (table.includes('resident')) return 'resident';
    if (table.includes('household')) return 'household';
    if (table.includes('eid')) return 'eid';
    if (table.includes('verification')) return 'verification';
    return 'default';
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  function formatCount(n) {
    if (n === null) return '—';
    return n.toLocaleString();
  }

  function getActivityIcon(type) {
    switch (type) {
      case 'resident': return PiUsersThree;
      case 'household': return FiHome;
      case 'eid': return FaRegAddressCard;
      default: return IoShieldCheckmarkOutline;
    }
  }

  const statCards = [
    { label: 'Total Residents', icon: PiUsersThree, value: formatCount(stats.totalResidents), sub: 'Live count from database' },
    { label: 'Total Households', icon: FiHome, value: formatCount(stats.totalHouseholds), sub: 'Active households only' },
    { label: 'Active eID', icon: FaRegAddressCard, value: formatCount(stats.activeEID), sub: 'Live count from database' },
  ];

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1">
        <DashboardHeader title="Dashboard" />

        <section className="px-5 py-7">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-gray-200 border-r-6 border-r-[#005F02] shadow-sm p-8"
                >
                  <div className="grid gap-y-3">
                    <div className="grid grid-cols-[44px_1fr] items-center gap-x-2">
                      <div className="flex items-center justify-center text-[#005F02]">
                        <Icon className="w-10 h-10" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-800">{card.label}</div>
                    </div>
                    <div>
                      {loading ? (
                        <div className="h-9 w-24 bg-gray-100 animate-pulse rounded mb-1" />
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                      )}
                      <div className="text-sm text-gray-500 mt-1">{card.sub}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lower panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

            {/* Recent Residents */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 border-r-6 border-r-[#005F02] shadow-sm p-8">
              <div className="px-5 py-1 border-b border-gray-200 flex items-center justify-between mb-4">
                <h2 className="text-[21px] font-semibold text-gray-900">Recent Residents</h2>
              </div>

              {loading ? (
                <div className="space-y-3 p-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : recentResidents.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No residents found.</div>
              ) : (
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs bg-gray-50 text-gray-500 border-b border-gray-200">
                        <th className="py-2 pr-4 font-semibold">Resident Name</th>
                        <th className="py-2 pr-4 font-semibold">Gender</th>
                        <th className="py-2 font-semibold">Date Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResidents.map((r, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-b-0">
                          <td className="py-3 pr-4 text-gray-800">{r.name}</td>
                          <td className="py-3 pr-4 text-gray-800">{r.gender}</td>
                          <td className="py-3 text-gray-800">{r.dateRegistered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent System Activity */}
            <div className="bg-white rounded-xl border border-gray-200 border-r-6 border-r-[#005F02] shadow-sm p-8">
              <div className="px-5 py-1 border-b border-gray-100 mb-4">
                <h2 className="text-[21px] font-semibold text-gray-900">Recent System Activity</h2>
              </div>

              {loading ? (
                <div className="space-y-3 p-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No recent activity.</div>
              ) : (
                <div className="p-5 space-y-4">
                  {recentActivity.map((a, idx) => {
                    const Icon = getActivityIcon(a.type);
                    return (
                      <div key={idx} className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#005F02] shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 capitalize truncate">{a.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{a.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}