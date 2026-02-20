import { FiHome, FiUsers, } from 'react-icons/fi';
import { FaRegAddressCard } from "react-icons/fa";
import { PiUsersThree } from "react-icons/pi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../../../core/AuthContext';

export default function Dashboard() {
  const { logout } = useAuth();
  const statCards = [
    { label: 'Total Residents', icon: PiUsersThree, value: '4,567', sub: 'Updated as of Jan 2026' },
    { label: 'Total Households', icon: FiHome, value: '1,067', sub: 'Updated as of Jan 2026' },
    { label: 'Active eID', icon: FaRegAddressCard, value: '367', sub: 'Updated as of Jan 2026' },
  ];

  const recentResidents = [
    {
      name: 'Carlo Jeus Cacho',
      address: '#71 Dahlia Avenue St.',
      gender: 'Male',
      dateRegistered: 'February 12, 2026',
    },
    {
      name: 'Murphy De Guzman',
      address: '#25 Taga Novaliches trapik',
      gender: 'Male',
      dateRegistered: 'Febuary 12,2026'

    },
  ];

  const recentActivity = [
    { title: 'Resident Added: Carlo Jeus Cacho', time: '5 hrs ago', icon: PiUsersThree },
    { title: "Households Created: Murphy De Guzman’s", time: '13 hrs ago', icon: FiHome },
    { title: 'eID Issued: Raine Heart Nacion', time: '19 hrs ago', icon: FaRegAddressCard },
    { title: 'Verification Approved: ID#1067', time: '9 hrs ago', icon: IoShieldCheckmarkOutline },
  ];

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1">
        <DashboardHeader title="Dashboard" onLogout={logout} />

        {/* Content */}
        <section className="px-5 py-7">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-gray-200 border-r-6 border-r-[#005F02] shadow-sm p-8 relative"
                >

                  {/* Parent grid with 2 rows: (1) icon+label, (2) value+sub */}
                  <div className="grid gap-y-3">
                    {/* Row 1: Icon + Label */}
                    <div className="grid grid-cols-[44px_1fr] items-center gap-x-2">
                      <div className="flex items-center justify-center text-[#005F02]">
                        <Icon className="w-10 h-10" />
                      </div>
                      <div className="text-2xl font-semibold text-gray-800">
                        {card.label}
                      </div>
                    </div>

                    {/* Row 2: Value + Sub (stacked) */}
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </div>
                      <div className="text-lg text-gray-500">
                        {card.sub}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lower panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 ">
            {/* Recent Residents */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden border-r-6 border-r-[#005F02] shadow-sm p-8 relative">
              <div className="px-5 py-1 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-[21px] font-semibold text-gray-900">Recent Residents</h2>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="text-left text-[12px bg-gray-50 text-gray-500 border-b border-gray-200">
                        <th className="py-2 pr-4 font-semibold">Residents Name</th>
                        <th className="py-2 pr-4 font-semibold">Address</th>
                        <th className="py-2 pr-4 font-semibold">Gender</th>
                        <th className="py-2 font-semibold">Date Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResidents.map((r, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-b-0">
                          <td className="py-3 pr-4 text-gray-800">{r.name}</td>
                          <td className="py-3 pr-4 text-gray-800">{r.address}</td>
                          <td className="py-3 pr-4 text-gray-800">{r.gender}</td>
                          <td className="py-3 text-gray-800">{r.dateRegistered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent System Activity */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden border-r-6 border-r-[#005F02] shadow-sm p-8 relative">
              <div className="px-5 py-1 border-b border-gray-100">
                <h2 className="text-[21px] font-semibold text-gray-900">Recent System Activity</h2>
              </div>

              <div className="p-5 space-y-4">
                {recentActivity.map((a, idx) => {
                  const Icon = a.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 border-b border-gray-100">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#005F02] shrink-0">
                        <Icon className="w-12 h-12" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-800 truncate">
                          {a.title}
                        </div>
                        <div className="text-base text-gray-500 mt-0.5">{a.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}