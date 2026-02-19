import { useState } from 'react';
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
  const [filters, setFilters] = useState({
    dateRange: 'last30',
    dateRangeLabel: 'Last 30 days',
    customStart: '',
    customEnd: '',
    year: String(new Date().getFullYear()),
    category: 'Category',
  });

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="Analytics" />

        <section className="px-5 py-7">
          <Filters onFilterChange={setFilters} />
          <AnalyticsCards filters={filters} />

          {/* Demographic Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Demographic</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopulationByAgeGroup filters={filters} />
              <GenderDistribution filters={filters} />
            </div>
          </div>


          {/* Household Section */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Household</h2>
              <HouseholdsPerPurok filters={filters} />
            </div>
          </div>

          {/* Brgy ID Section - ID Renewal Statistics and Status side by side */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Brgy ID</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IdRenewalStatistics filters={filters} />
                <div>
                  <h3 className="text-base font-medium text-gray-700 mb-3">Status</h3>
                  <ActiveVsInactive filters={filters} />
                </div>
              </div>
            </div>
          </div>

          {/* Growth Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Growth</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <NewResidentsPerYear filters={filters} />
              <ResidentsTransferredOut filters={filters} />
              <PopulationGrowth filters={filters} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
