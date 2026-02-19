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
    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6" data-date-range={activeDateRange}>
      {/* Date Range Filter */}
      <DateRangeFilter
        dateRangeLabel={dateRangeLabel}
        customStart={customStart}
        customEnd={customEnd}
        onDateRangeChange={handleDateRangeChange}
        filterYear={filterYear}
      />

      {/* Filter by Section */}
      <div className="inline-flex items-center gap-2 flex-wrap p-2 rounded-xl border-gray-200">
        <span className="text-sm font-semibold px-1">Filter by:</span>
        <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
