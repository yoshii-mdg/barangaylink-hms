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
import { useAnalytics } from '../../../hooks/useAnalytics';

export default function Analytics() {
  const [filters, setFilters] = useState({
    dateRange: 'last30',
    dateRangeLabel: 'Last 30 days',
    customStart: '',
    customEnd: '',
    year: String(new Date().getFullYear()),
    category: 'Category',
  });

  const { data, loading, error, reload } = useAnalytics();

  return (
    <div className="min-h-screen flex bg-[#F3F7F3]">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto">
        <DashboardHeader title="Analytics" />

        <section className="px-5 py-7">
          <Filters onFilterChange={setFilters} />

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={reload}
                className="ml-4 text-xs underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Summary Cards */}
          <AnalyticsCards
            filters={filters}
            summaryData={data.summary}
            loading={loading}
          />

          {/* Demographic Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Demographic</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopulationByAgeGroup
                filters={filters}
                data={data.populationByAge}
                loading={loading}
              />
              <GenderDistribution
                filters={filters}
                data={data.genderDistribution}
                loading={loading}
              />
            </div>
          </div>

          {/* Household Section */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Household</h2>
              <HouseholdsPerPurok
                filters={filters}
                data={data.householdsPerPurok}
                loading={loading}
              />
            </div>
          </div>

          {/* Brgy ID Section */}
          <div className="mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Brgy ID</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IdRenewalStatistics
                  filters={filters}
                  data={data.eidRenewalStats}
                  loading={loading}
                />
                <ActiveVsInactive
                  filters={filters}
                  data={data.activeVsInactive}
                  loading={loading}
                />
              </div>
            </div>
          </div>

          {/* Resident Trends */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Resident Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NewResidentsPerYear
                filters={filters}
                data={data.newResidentsPerYear}
                loading={loading}
              />
              <ResidentsTransferredOut
                filters={filters}
                data={data.residentsTransferredOut}
                loading={loading}
              />
            </div>
          </div>

          {/* Population Growth */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-[21px] font-semibold text-gray-900 mb-4">Population Growth</h2>
            <PopulationGrowth
              filters={filters}
              data={data.populationGrowth}
              loading={loading}
            />
          </div>

        </section>
      </main>
    </div>
  );
}