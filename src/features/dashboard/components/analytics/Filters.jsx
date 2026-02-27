import { useState, useEffect } from 'react';
import DateRangeFilter from './filters/DateRangeFilter';
import YearFilter from './filters/YearFilter';
import FilterAll from './filters/FilterAll';
import CategoryFilter from './filters/CategoryFilter';

export default function Filters({ onFilterChange }) {
  const [dateRangeLabel, setDateRangeLabel] = useState('Last 30 days');
  const [activeDateRange, setActiveDateRange] = useState('last30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  const [filterAll, setFilterAll] = useState('All');
  const [filterCategory, setFilterCategory] = useState('Category');

  // Initial filter state on mount
  useEffect(() => {
    const currentYear = String(new Date().getFullYear());
    onFilterChange?.({
      dateRange: 'last30',
      dateRangeLabel: 'Last 30 days',
      customStart: '',
      customEnd: '',
      year: currentYear,
      category: 'Category',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle date range changes
  const handleDateRangeChange = (data) => {
    setDateRangeLabel(data.dateRangeLabel);
    setActiveDateRange(data.dateRange);
    setCustomStart(data.customStart);
    setCustomEnd(data.customEnd);

    onFilterChange?.({
      dateRange: data.dateRange,
      dateRangeLabel: data.dateRangeLabel,
      customStart: data.customStart,
      customEnd: data.customEnd,
      year: filterYear,
      category: filterCategory,
    });
  };

  // Handle year change - resets date range to default
  const handleYearChange = (year) => {
    setFilterYear(year);
    setActiveDateRange('last30');
    setDateRangeLabel('Last 30 days');
    setCustomStart('');
    setCustomEnd('');

    onFilterChange?.({
      dateRange: 'last30',
      dateRangeLabel: 'Last 30 days',
      customStart: '',
      customEnd: '',
      year,
      category: filterCategory,
    });
  };

  // Handle filter all change
  const handleFilterAllChange = (value) => {
    setFilterAll(value);
    onFilterChange?.({
      dateRange: activeDateRange,
      dateRangeLabel,
      customStart,
      customEnd,
      year: filterYear,
      category: filterCategory,
      filterAll: value,
    });
  };

  // Handle category change
  const handleCategoryChange = (value) => {
    setFilterCategory(value);
    onFilterChange?.({
      dateRange: activeDateRange,
      dateRangeLabel,
      customStart,
      customEnd,
      year: filterYear,
      category: value,
    });
  };

  // Reset all filters to default
  const handleResetAll = () => {
    const currentYear = String(new Date().getFullYear());
    setDateRangeLabel('Last 30 days');
    setActiveDateRange('last30');
    setCustomStart('');
    setCustomEnd('');
    setFilterYear(currentYear);
    setFilterAll('All');
    setFilterCategory('Category');

    onFilterChange?.({
      dateRange: 'last30',
      dateRangeLabel: 'Last 30 days',
      customStart: '',
      customEnd: '',
      year: currentYear,
      category: 'Category',
      filterAll: 'All',
    });
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8" data-date-range={activeDateRange}>
      {/* Date Range Filter */}
      <div className="w-full xl:w-auto">
        <DateRangeFilter
          dateRangeLabel={dateRangeLabel}
          customStart={customStart}
          customEnd={customEnd}
          onDateRangeChange={handleDateRangeChange}
          filterYear={filterYear}
        />
      </div>

      {/* Filter by Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 w-full xl:w-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by:</span>
          <div className="h-px w-full bg-gray-200 md:hidden" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter All - Location Filter */}
          <FilterAll
            selectedFilter={filterAll}
            onFilterChange={handleFilterAllChange}
          />

          {/* Year Filter */}
          <YearFilter
            selectedYear={filterYear}
            onYearChange={handleYearChange}
          />

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={filterCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <button
          onClick={handleResetAll}
          className="text-sm font-medium text-gray-500 hover:text-[#005F02] transition-colors md:ml-2 text-left"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
