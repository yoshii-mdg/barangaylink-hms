import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";

const FILTER_YEAR_PAGE_SIZE = 9; // 3 rows x 3 columns

export default function YearFilter({ 
  selectedYear, 
  onYearChange
}) {
  const [filterYearOpen, setFilterYearOpen] = useState(false);
  const [filterYearRangeStart, setFilterYearRangeStart] = useState(() => new Date().getFullYear() - 4);
  const filterYearRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterYearRef.current && !filterYearRef.current.contains(e.target)) {
        setFilterYearOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearSelect = (year) => {
    const yearStr = String(year);
    onYearChange(yearStr);
    setFilterYearOpen(false);
  };

  const handleYearButtonClick = () => {
    setFilterYearOpen((o) => !o);
    const currentYear = parseInt(selectedYear, 10);
    if (!isNaN(currentYear)) {
      setFilterYearRangeStart(Math.max(2000, currentYear - 4));
    }
  };

  return (
    <div className="relative" ref={filterYearRef}>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={handleYearButtonClick}
          className="inline-flex items-center gap-5 px-4 py-2 rounded-lg text-sm border border-gray-300 shrink-0 min-w-[90px] justify-between bg-white hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-5">
            <span className="font-semibold">Year </span>
          </span>
          <div className="inline-flex items-center gap-0.5 border border-gray-300 rounded px-2 py-0.5">
            {selectedYear}
            <IoIosArrowDown className={`w-4 h-4 shrink-0 transition-transform ${filterYearOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </div>

      {filterYearOpen && (
        <div className="absolute top-full left-0 mt-1 p-4 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[240px]">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setFilterYearRangeStart((y) => Math.max(2000, y - FILTER_YEAR_PAGE_SIZE))}
              aria-label="Previous years"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {filterYearRangeStart} – {filterYearRangeStart + FILTER_YEAR_PAGE_SIZE - 1}
            </span>
            <button
              type="button"
              onClick={() => setFilterYearRangeStart((y) => y + FILTER_YEAR_PAGE_SIZE)}
              aria-label="Next years"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {Array.from({ length: FILTER_YEAR_PAGE_SIZE }, (_, i) => filterYearRangeStart + i).map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => handleYearSelect(y)}
                className={`py-2 rounded-lg text-sm font-medium ${String(y) === selectedYear ? 'bg-[#005F02] text-white' : 'text-gray-800 hover:bg-gray-100'}`}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                const currentYear = String(new Date().getFullYear());
                handleYearSelect(parseInt(currentYear, 10));
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Reset Year
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
