import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import {
  Filters,
  AnalyticsCards,
  PopulationByAgeGroup,
  GenderDistribution,
  IdRenewalStatistics,
  HouseholdsPerPurok,
  ActiveVsInactive,
  NewResidentsPerYear,
  ResidentsTransferredOut,
  PopulationGrowth,
} from '../components/analytics';

export default function Analytics() {
  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="Analytics" />

        <section className="px-5 py-7">
          <Filters />
          <AnalyticsCards />

          {/* Demographic Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Demographic</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopulationByAgeGroup />
              <GenderDistribution />
            </div>
          </div>

          {/* Brgy ID Section - ID Renewal Statistics only (no Total IDs Issued card) */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Brgy ID</h2>
              <IdRenewalStatistics />
            </div>
          </div>

          {/* Household Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200  shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Household</h2>
              <HouseholdsPerPurok />
            </div>
            <div className="bg-white rounded-xl border border-gray-200  shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Status</h2>
              <ActiveVsInactive />
            </div>
          </div>

          {/* Growth Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Growth</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <NewResidentsPerYear />
              <ResidentsTransferredOut />
              <PopulationGrowth />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
